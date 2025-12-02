// deno-lint-ignore-file no-import-prefix
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
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

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Insert comment - auto-approved since email was validated by EmailListVerify
    const { data: comment, error: insertError } = await supabaseClient
      .from("comments")
      .insert({
        article_id: validatedArticleId.data,
        email: validatedEmail.data,
        name: sanitizedName,
        content: sanitizedContent,
        parent_comment_id: parentCommentId || null,
        verification_token: null,
        verification_expires_at: null,
        is_email_verified: true,
        is_approved: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting comment:", insertError);
      return errorResponse("Failed to submit comment", 500, corsHeaders);
    }

    console.log("Comment auto-approved after email validation:", comment.id);

    return successResponse({ 
      success: true, 
      message: "Your comment has been published successfully!"
    }, corsHeaders);
  } catch (error) {
    console.error("Error in submit-comment function:", error);
    return errorResponse("Internal server error", 500, corsHeaders);
  }
});