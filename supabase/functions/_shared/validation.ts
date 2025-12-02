// deno-lint-ignore-file no-import-prefix
// Shared input validation and sanitization utilities for edge functions
// Prevents XSS, injection attacks, and ensures data integrity

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Common validation schemas
export const emailSchema = z.string()
  .trim()
  .email({ message: "Invalid email format" })
  .max(255, { message: "Email must be less than 255 characters" })
  .transform(email => email.toLowerCase());

export const nameSchema = z.string()
  .trim()
  .min(1, { message: "Name cannot be empty" })
  .max(100, { message: "Name must be less than 100 characters" })
  .regex(/^[a-zA-Z0-9\s\u00C0-\u024F\u1E00-\u1EFF'.,-]+$/, { 
    message: "Name can only contain letters, numbers, spaces, apostrophes, periods, commas, and hyphens" 
  });

export const contentSchema = z.string()
  .trim()
  .min(1, { message: "Content cannot be empty" })
  .max(5000, { message: "Content must be less than 5000 characters" });

export const uuidSchema = z.string()
  .uuid({ message: "Invalid ID format" });

export const urlSchema = z.string()
  .url({ message: "Invalid URL format" })
  .max(2048, { message: "URL too long" });

// HTML sanitization - strips potentially dangerous tags and attributes
export function sanitizeHtml(input: string): string {
  // Remove script tags and content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (except for images)
  sanitized = sanitized.replace(/data:(?!image)/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object and embed tags
  sanitized = sanitized.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
  
  return sanitized;
}

// Plain text sanitization - removes all HTML
export function sanitizePlainText(input: string): string {
  // Remove all HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
  
  return sanitized.trim();
}

// SQL injection prevention - validates identifiers
export function validateIdentifier(input: string): boolean {
  // Only allow alphanumeric characters, underscores, and hyphens
  return /^[a-zA-Z0-9_-]+$/.test(input);
}

// Rate limiting check helper
export function checkRateLimit(
  lastAttempt: Date | null,
  minIntervalMinutes: number
): { allowed: boolean; message?: string } {
  if (!lastAttempt) {
    return { allowed: true };
  }

  const now = new Date();
  const timeDiff = now.getTime() - new Date(lastAttempt).getTime();
  const minutesDiff = timeDiff / (1000 * 60);

  if (minutesDiff < minIntervalMinutes) {
    const remainingMinutes = Math.ceil(minIntervalMinutes - minutesDiff);
    return {
      allowed: false,
      message: `Please wait ${remainingMinutes} minute(s) before trying again`
    };
  }

  return { allowed: true };
}

// Validation response helper
export function validationError(message: string, corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: 400, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

// Success response helper
export function successResponse(data: unknown, corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify(data),
    { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

// Error response helper
export function errorResponse(message: string, status: number, corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

// Email validation using EmailListVerify API
export async function validateEmailExists(email: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    const apiKey = Deno.env.get("EMAILLISTVERIFY_API_KEY");
    if (!apiKey) {
      return { valid: false, error: "Email validation service not configured" };
    }

    const response = await fetch(
      `https://apps.emaillistverify.com/api/verifyEmail?secret=${apiKey}&email=${encodeURIComponent(email)}`
    );

    if (!response.ok) {
      console.error("Email verification failed:", await response.text());
      return { valid: false, error: "Email verification service unavailable" };
    }

    const result = await response.text();
    console.log("EmailListVerify result:", result);
    
    // Valid statuses from EmailListVerify: ok, ok_for_all, unknown
    // Invalid statuses: email_disabled, invalid_syntax, disposable, spam_traps, etc.
    const validStatuses = ["ok", "ok_for_all"];
    const unknownButAcceptable = ["unknown"]; // Accept unknown as we'll verify via email link
    
    if (result === "disposable") {
      return { 
        valid: false, 
        error: "Disposable email addresses are not allowed. Please use a real email address." 
      };
    }
    
    if (result === "invalid_syntax") {
      return { 
        valid: false, 
        error: "Invalid email format. Please check your email address." 
      };
    }
    
    if (result === "email_disabled") {
      return { 
        valid: false, 
        error: "This email address appears to be disabled or inactive." 
      };
    }
    
    if (!validStatuses.includes(result) && !unknownButAcceptable.includes(result)) {
      return { 
        valid: false, 
        error: "This email address could not be verified. Please use a valid email address." 
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("Email validation error:", error);
    return { valid: false, error: "Email validation failed" };
  }
}

// reCAPTCHA verification
export async function verifyRecaptcha(token: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    const recaptchaSecret = Deno.env.get("RECAPTCHA_SECRET_KEY");
    if (!recaptchaSecret) {
      return { valid: false, error: "reCAPTCHA not configured" };
    }

    const verifyResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${recaptchaSecret}&response=${token}`,
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return { 
        valid: false, 
        error: "reCAPTCHA verification failed. Please try again." 
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { valid: false, error: "reCAPTCHA verification failed" };
  }
}
