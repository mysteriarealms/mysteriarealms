// deno-lint-ignore-file no-explicit-any
// deno-lint-ignore no-import-prefix
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// deno-lint-ignore no-import-prefix
import { Resend } from "https://esm.sh/resend@2.0.0";
// deno-lint-ignore no-import-prefix
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WinnerEmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT token and admin role
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin role using service role key
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: hasAdminRole } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!hasAdminRole) {
      console.error("User does not have admin role:", user.id);
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, email }: WinnerEmailRequest = await req.json();

    console.log(`Sending winner notification to ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Mysteria Realm <onboarding@resend.dev>",
      to: [email],
      subject: "🏆 Congratulations! You Won the Mystery Challenge!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏆 Congratulations!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Dear ${name},</h2>
            
            <p style="color: #555; line-height: 1.6;">
              We're thrilled to announce that <strong>your theory has been selected as the winner</strong> 
              of this week's Mystery Challenge! 🎉
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              Your exceptional detective skills and insightful analysis stood out among all submissions. 
              You've earned the prestigious <strong>Detective Badge</strong> and gained +50 reputation points!
            </p>
            
            <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #667eea; font-weight: bold;">🔍 Detective Badge Awarded</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                Your profile now displays your detective achievement. Continue participating to maintain your status!
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Keep an eye out for next week's mystery challenge. Can you solve it again?
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              Best regards,<br>
              <strong>The Mysteria Realm Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px;">
            <p style="color: #999; font-size: 12px;">
              Visit <a href="https://mysteriarealm.com" style="color: #667eea;">Mysteria Realm</a> 
              to check out the next challenge!
            </p>
          </div>
        </div>
      `,
    });

    console.log("Winner email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-mystery-winner-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
