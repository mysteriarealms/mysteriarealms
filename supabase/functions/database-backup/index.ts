// deno-lint-ignore-file no-import-prefix
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BackupResult {
  success: boolean;
  timestamp: string;
  tables: string[];
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting database backup...");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const timestamp = new Date().toISOString();
    const backupData: Record<string, unknown[]> = {};
    const tables = [
      "articles",
      "categories",
      "comments",
      "user_reputation",
      "mystery_challenges",
      "challenge_theories",
      "theory_votes",
      "whitelisted_ips",
      "user_roles"
    ];

    // Backup each table
    for (const table of tables) {
      console.log(`Backing up table: ${table}`);
      
      const { data, error } = await supabaseClient
        .from(table)
        .select("*");

      if (error) {
        console.error(`Error backing up ${table}:`, error);
        throw new Error(`Failed to backup ${table}: ${error.message}`);
      }

      backupData[table] = data || [];
      console.log(`Backed up ${data?.length || 0} records from ${table}`);
    }

    // Create backup file content
    const backupContent = {
      timestamp,
      version: "1.0",
      tables: backupData,
      metadata: {
        total_tables: tables.length,
        total_records: Object.values(backupData).reduce(
          (sum, records) => sum + records.length,
          0
        ),
      },
    };

    const backupJson = JSON.stringify(backupContent, null, 2);
    const fileName = `backup-${timestamp.replace(/[:.]/g, "-")}.json`;

    // Store backup in storage bucket
    const { error: uploadError } = await supabaseClient.storage
      .from("database-backups")
      .upload(fileName, backupJson, {
        contentType: "application/json",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading backup:", uploadError);
      throw new Error(`Failed to upload backup: ${uploadError.message}`);
    }

    console.log(`Backup completed successfully: ${fileName}`);

    // Clean up old backups (keep only last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: oldBackups, error: listError } = await supabaseClient.storage
      .from("database-backups")
      .list();

    if (!listError && oldBackups) {
      for (const file of oldBackups) {
        const fileDate = new Date(file.created_at);
        if (fileDate < thirtyDaysAgo) {
          console.log(`Deleting old backup: ${file.name}`);
          await supabaseClient.storage
            .from("database-backups")
            .remove([file.name]);
        }
      }
    }

    const result: BackupResult = {
      success: true,
      timestamp,
      tables,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Database backup error:", error);
    
    const result: BackupResult = {
      success: false,
      timestamp: new Date().toISOString(),
      tables: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
