// deno-lint-ignore-file no-import-prefix
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        `<html>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1>❌ Invalid Verification Link</h1>
            <p>The verification link is missing required parameters.</p>
          </body>
        </html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find comment with this token
    const { data: comment, error: findError } = await supabaseClient
      .from("comments")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (findError || !comment) {
      console.error("Comment not found:", findError);
      return new Response(
        `<html>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1>❌ Invalid or Expired Link</h1>
            <p>This verification link is invalid or has already been used.</p>
          </body>
        </html>`,
        { status: 404, headers: { "Content-Type": "text/html" } }
      );
    }

    // Check if token has expired
    if (new Date(comment.verification_expires_at) < new Date()) {
      return new Response(
        `<html>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1>⏰ Link Expired</h1>
            <p>This verification link has expired. Please submit your comment again.</p>
          </body>
        </html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Verify the email and auto-approve the comment
    const { error: updateError } = await supabaseClient
      .from("comments")
      .update({
        is_email_verified: true,
        is_approved: true, // Auto-approve after email verification
        verification_token: null,
        verification_expires_at: null,
      })
      .eq("id", comment.id);

    if (updateError) {
      console.error("Error updating comment:", updateError);
      return new Response(
        `<html>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1>❌ Verification Failed</h1>
            <p>There was an error verifying your email. Please try again.</p>
          </body>
        </html>`,
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }

    return new Response(
      `<html>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
          <div style="background: white; color: #333; padding: 40px; border-radius: 12px; max-width: 500px;">
            <h1 style="color: #8B5CF6;">✅ Email Verified!</h1>
            <p style="font-size: 18px; margin: 20px 0;">Your email has been successfully verified.</p>
            <p style="font-size: 16px; color: #10b981; font-weight: 600;">🎉 Your comment is now live!</p>
            <p style="color: #666; margin-top: 10px;">Your comment has been automatically published. Thank you for sharing your experience!</p>
            <p style="margin-top: 30px;">
              <a href="/" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Return to Mysteria Realm</a>
            </p>
          </div>
        </body>
      </html>`,
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("Error in verify-comment function:", error);
    return new Response(
      `<html>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1>❌ Error</h1>
          <p>An unexpected error occurred. Please try again later.</p>
        </body>
      </html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
});