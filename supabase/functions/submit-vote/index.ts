// deno-lint-ignore-file no-import-prefix no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VoteSubmission {
  theory_id: string;
  voter_email: string;
  fingerprint: string;
  recaptcha_token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { theory_id, voter_email, fingerprint, recaptcha_token }: VoteSubmission = await req.json();

    // Validate required fields
    if (!theory_id || !voter_email || !fingerprint || !recaptcha_token) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify reCAPTCHA token
    const recaptchaSecret = Deno.env.get("RECAPTCHA_SECRET_KEY");
    if (!recaptchaSecret) {
      console.error("RECAPTCHA_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${recaptchaSecret}&response=${recaptcha_token}`,
      }
    );

    const recaptchaData = await recaptchaResponse.json();
    
    if (!recaptchaData.success) {
      console.error("reCAPTCHA verification failed:", recaptchaData);
      return new Response(
        JSON.stringify({ error: "reCAPTCHA verification failed. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(voter_email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const normalizedEmail = voter_email.trim().toLowerCase();

    // Rate limiting: Check if this email OR fingerprint voted recently (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentVotes } = await supabase
      .from("theory_votes")
      .select("id")
      .or(`voter_email.eq.${normalizedEmail},fingerprint.eq.${fingerprint}`)
      .gte("created_at", fiveMinutesAgo);

    if (recentVotes && recentVotes.length > 0) {
      return new Response(
        JSON.stringify({ error: "Please wait before voting again" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate vote by email OR fingerprint
    const { data: existingVoteByEmail } = await supabase
      .from("theory_votes")
      .select("id")
      .eq("theory_id", theory_id)
      .eq("voter_email", normalizedEmail)
      .single();

    const { data: existingVoteByFingerprint } = await supabase
      .from("theory_votes")
      .select("id")
      .eq("theory_id", theory_id)
      .eq("fingerprint", fingerprint)
      .single();

    if (existingVoteByEmail || existingVoteByFingerprint) {
      return new Response(
        JSON.stringify({ error: "You have already voted for this theory" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert vote
    const { error: voteError } = await supabase
      .from("theory_votes")
      .insert({
        theory_id,
        voter_email: normalizedEmail,
        fingerprint,
      });

    if (voteError) {
      console.error("Vote insert error:", voteError);
      if (voteError.message?.includes("duplicate")) {
        return new Response(
          JSON.stringify({ error: "You have already voted for this theory" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to submit vote" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment upvotes count
    const { data: theory } = await supabase
      .from("challenge_theories")
      .select("upvotes")
      .eq("id", theory_id)
      .single();

    if (theory) {
      await supabase
        .from("challenge_theories")
        .update({ upvotes: (theory.upvotes || 0) + 1 })
        .eq("id", theory_id);
    }

    console.log(`Vote submitted successfully for theory ${theory_id} by ${normalizedEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Vote counted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in submit-vote function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
