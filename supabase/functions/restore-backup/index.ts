// deno-lint-ignore-file no-import-prefix
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RestoreResult {
  success: boolean;
  timestamp: string;
  restored_tables: string[];
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { backupFile } = await req.json();

    if (!backupFile) {
      return new Response(
        JSON.stringify({ error: "Backup file name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting database restore from: ${backupFile}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Download backup file
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from("database-backups")
      .download(backupFile);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download backup: ${downloadError?.message}`);
    }

    const backupContent = JSON.parse(await fileData.text());
    const restoredTables: string[] = [];

    console.log(`Restoring backup from: ${backupContent.timestamp}`);

    // Restore each table
    for (const [tableName, records] of Object.entries(backupContent.tables)) {
      if (!Array.isArray(records) || records.length === 0) {
        console.log(`Skipping empty table: ${tableName}`);
        continue;
      }

      console.log(`Restoring ${records.length} records to ${tableName}`);

      // Note: This is a simple restore that inserts records
      // For production, consider more sophisticated conflict resolution
      const { error: insertError } = await supabaseClient
        .from(tableName)
        .upsert(records as never[], { onConflict: "id" });

      if (insertError) {
        console.error(`Error restoring ${tableName}:`, insertError);
        throw new Error(`Failed to restore ${tableName}: ${insertError.message}`);
      }

      restoredTables.push(tableName);
      console.log(`Successfully restored ${tableName}`);
    }

    console.log("Database restore completed successfully");

    const result: RestoreResult = {
      success: true,
      timestamp: new Date().toISOString(),
      restored_tables: restoredTables,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Database restore error:", error);

    const result: RestoreResult = {
      success: false,
      timestamp: new Date().toISOString(),
      restored_tables: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
