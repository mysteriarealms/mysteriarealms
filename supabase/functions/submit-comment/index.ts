// deno-lint-ignore-file no-import-prefix
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { 
  emailSchema, 
  nameSchema, 
  contentSchema, 
  uuidSchema,
  sanitizePlainText,
  validationError,
  successResponse,
  errorResponse,
  validateEmailExists
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, email, name, content, parentCommentId } = await req.json();

    // Validate required fields
    if (!articleId || !email || !name || !content) {
      return validationError("Missing required fields", corsHeaders);
    }

    // Validate and sanitize inputs using schemas
    const validatedEmail = emailSchema.safeParse(email);
    if (!validatedEmail.success) {
      return validationError(validatedEmail.error.errors[0].message, corsHeaders);
    }

    const validatedName = nameSchema.safeParse(name);
    if (!validatedName.success) {
      return validationError(validatedName.error.errors[0].message, corsHeaders);
    }

    const validatedContent = contentSchema.safeParse(content);
    if (!validatedContent.success) {
      return validationError(validatedContent.error.errors[0].message, corsHeaders);
    }

    const validatedArticleId = uuidSchema.safeParse(articleId);
    if (!validatedArticleId.success) {
      return validationError("Invalid article ID", corsHeaders);
    }

    if (parentCommentId) {
      const validatedParentId = uuidSchema.safeParse(parentCommentId);
      if (!validatedParentId.success) {
        return validationError("Invalid parent comment ID", corsHeaders);
      }
    }

    // Sanitize text content
    const sanitizedName = sanitizePlainText(validatedName.data);
    const sanitizedContent = sanitizePlainText(validatedContent.data);

    // Verify email exists using Abstract API
    const emailValidation = await validateEmailExists(validatedEmail.data);
    if (!emailValidation.valid) {
      return errorResponse(emailValidation.error || "Email validation failed", 400, corsHeaders);
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Insert comment with verification token
    // deno-lint-ignore no-unused-vars
    const { data: comment, error: insertError } = await supabaseClient
      .from("comments")
      .insert({
        article_id: validatedArticleId.data,
        email: validatedEmail.data,
        name: sanitizedName,
        content: sanitizedContent,
        parent_comment_id: parentCommentId || null,
        verification_token: verificationToken,
        verification_expires_at: verificationExpiresAt.toISOString(),
        is_email_verified: false,
        is_approved: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting comment:", insertError);
      return errorResponse("Failed to submit comment", 500, corsHeaders);
    }

    // Send verification email using Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const verificationLink = `${Deno.env.get("SUPABASE_URL")}/functions/v1/verify-comment?token=${verificationToken}`;

    await resend.emails.send({
      from: "Mysteria Realm <onboarding@resend.dev>",
      to: [validatedEmail.data],
      subject: "Verify your comment on Mysteria Realm",
      html: `
        <h2>Verify Your Comment</h2>
        <p>Hello ${sanitizedName},</p>
        <p>Thank you for sharing your experience on Mysteria Realm! To complete your comment submission, please verify your email address by clicking the link below:</p>
        <p><a href="${verificationLink}" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Once verified, your comment will be reviewed by our moderators before being published.</p>
        <br>
        <p>Best regards,<br>The Mysteria Realm Team</p>
      `,
    });

    return successResponse({ 
      success: true, 
      message: "Comment submitted! Please check your email to verify and publish your comment."
    }, corsHeaders);
  } catch (error) {
    console.error("Error in submit-comment function:", error);
    return errorResponse("Internal server error", 500, corsHeaders);
  }
});