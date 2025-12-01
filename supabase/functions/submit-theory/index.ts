import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TheorySubmission {
  challenge_id: string;
  user_name: string;
  user_email: string;
  theory_content: string;
  recaptcha_token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { challenge_id, user_name, user_email, theory_content, recaptcha_token }: TheorySubmission = await req.json();

    // Validate required fields
    if (!challenge_id || !user_name || !user_email || !theory_content || !recaptcha_token) {
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
    if (!emailRegex.test(user_email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email deliverability using Abstract API
    const abstractApiKey = Deno.env.get("ABSTRACT_API_KEY");
    if (abstractApiKey) {
      try {
        const emailValidationResponse = await fetch(
          `https://emailvalidation.abstractapi.com/v1/?api_key=${abstractApiKey}&email=${encodeURIComponent(user_email)}`
        );
        const validationData = await emailValidationResponse.json();

        if (!validationData.is_valid_format?.value || validationData.deliverability !== "DELIVERABLE") {
          console.log("Email validation failed:", validationData);
          return new Response(
            JSON.stringify({ error: "Email address is not valid or deliverable" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (error) {
        console.error("Email validation error:", error);
        // Continue anyway - don't block submission on API failure
      }
    }

    // Validate content length
    if (theory_content.length < 10 || theory_content.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Theory must be between 10 and 5000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (user_name.length < 2 || user_name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name must be between 2 and 100 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert theory into database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: insertError } = await supabase
      .from("challenge_theories")
      .insert({
        challenge_id,
        user_name: user_name.trim(),
        user_email: user_email.trim().toLowerCase(),
        theory_content: theory_content.trim(),
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to submit theory" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Theory submitted successfully by ${user_email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Theory submitted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in submit-theory function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
