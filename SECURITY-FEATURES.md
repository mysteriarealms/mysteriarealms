# Security Features Documentation

This document outlines the comprehensive security measures implemented in Mysteria Realm.

## 1. Content Security Policy (CSP)

**Location:** `index.html`

CSP headers prevent XSS attacks and restrict resource loading to trusted sources:

- **Scripts:** Only from same origin, Google reCAPTCHA, and inline scripts (required for Vite)
- **Styles:** Only from same origin and Google Fonts
- **Images:** From same origin, data URIs, HTTPS, and blob URIs
- **Connections:** Only to same origin, Supabase backend, Abstract API, and Google
- **Frames:** Only from same origin and Google reCAPTCHA
- **Object/Embed:** Blocked entirely
- **Upgrade Insecure Requests:** Forces HTTPS

## 2. Input Validation & Sanitization

**Location:** `supabase/functions/_shared/validation.ts`

Comprehensive validation middleware for all edge functions:

### Features:
- **Zod Schema Validation:** Type-safe input validation
- **Email Validation:** Format validation + real email verification via Abstract API
- **Name Validation:** Alphanumeric characters, spaces, hyphens only (max 100 chars)
- **Content Validation:** Length limits (max 5000 chars)
- **UUID Validation:** Strict UUID format checking
- **HTML Sanitization:** Removes script tags, event handlers, javascript: protocol, iframes
- **Plain Text Sanitization:** Strips all HTML tags and decodes entities
- **SQL Injection Prevention:** Identifier validation

### Helper Functions:
- `validationError()` - Standardized error responses
- `successResponse()` - Standardized success responses
- `errorResponse()` - Standardized error responses with custom status
- `validateEmailExists()` - Real email verification
- `verifyRecaptcha()` - reCAPTCHA token verification
- `checkRateLimit()` - Rate limiting validation

## 3. Database Backup System

**Location:** `supabase/functions/database-backup/` and `supabase/functions/restore-backup/`

Automated daily backups stored securely in Supabase Storage:

### Features:
- **Automated Daily Backups:** Runs at 2 AM UTC via pg_cron
- **Secure Storage:** Backups stored in private `database-backups` bucket
- **Admin-Only Access:** RLS policies restrict access to admin users
- **30-Day Retention:** Automatically deletes backups older than 30 days
- **Comprehensive Coverage:** Backs up all critical tables:
  - articles
  - categories
  - comments
  - user_reputation
  - mystery_challenges
  - challenge_theories
  - theory_votes
  - whitelisted_ips
  - user_roles

### Backup Schedule:
```sql
-- Runs daily at 2 AM UTC
SELECT cron.schedule('daily-database-backup', '0 2 * * *', ...);
```

### Manual Backup:
Admins can trigger manual backups by calling the `database-backup` edge function with admin JWT.

### Restore Process:
Use the `restore-backup` edge function with admin JWT and specify the backup file name:
```json
{
  "backupFile": "backup-2025-11-30T02-00-00-000Z.json"
}
```

## 4. Edge Function Security

All edge functions implement:

### Authentication:
- **Admin Functions:** Require JWT verification (`verify_jwt = true`)
  - `send-mystery-winner-email`
  - `database-backup`
  - `restore-backup`
- **Public Functions:** Open for public access with validation
  - `submit-comment` (with email verification)
  - `submit-theory` (with reCAPTCHA)
  - `submit-vote` (with reCAPTCHA and rate limiting)

### Rate Limiting:
- Theory voting: 5-minute cooldown between votes per email
- Comment submission: Email verification required
- IP-based rate limiting (implemented at edge function level)

### Bot Prevention:
- Google reCAPTCHA v2 on theory submission
- Google reCAPTCHA v2 on voting
- Email validation via Abstract API
- Browser fingerprinting for duplicate detection

## 5. Row-Level Security (RLS)

All database tables have strict RLS policies:

### Admin-Only Access:
- `articles` (unpublished)
- `categories` (modification)
- `user_roles` (all operations)
- `whitelisted_ips` (all operations)
- `comments` (all comments including unverified)

### Public Read Access:
- Published articles
- Approved and verified comments
- Active mystery challenges
- Public theories and votes

### Write Restrictions:
- Comment updates only for verification
- User reputation updates only via triggers (prevents manipulation)
- Theory updates only by admins

## 6. Admin Panel Security

**Location:** `src/pages/AdminLogin.tsx`

Multi-layer security for admin access:

- **IP Whitelisting:** Only trusted IPs can access
- **Role-Based Access:** Server-side role verification via `has_role()` function
- **Rate Limiting:** 5 failed attempts = 15-minute lockout
- **Session Timeout:** 30 minutes of inactivity
- **Input Validation:** Zod schema validation
- **Secure Error Messages:** Generic messages to prevent information leakage

## 7. Security Best Practices

### Implemented:
✅ HTTPS enforcement via CSP
✅ No sensitive data in client-side code
✅ Service role keys only in edge functions
✅ Parameterized queries (Supabase client methods)
✅ CORS properly configured
✅ Input sanitization on all user inputs
✅ Email verification for comments
✅ reCAPTCHA for form submissions
✅ Rate limiting on voting
✅ Automated backups with retention policy
✅ Admin-only database restoration
✅ Fixed search_path in security definer functions

### Recommendations:
- Enable Leaked Password Protection in backend settings
- Monitor edge function logs for suspicious activity
- Regularly review admin activity logs
- Test backup restoration process periodically
- Review and update whitelisted IPs as needed

## 8. Monitoring & Logging

All edge functions include comprehensive logging:
- Request validation failures
- Email verification results
- reCAPTCHA verification results
- Database operation results
- Backup/restore operations

Access logs via Lovable Cloud → Functions → [function-name] → Logs

## 9. Compliance

- **GDPR:** Cookie consent banner, privacy policy
- **Google AdSense:** Legal pages (privacy, terms, cookie policy)
- **Security Headers:** CSP implemented
- **Data Protection:** Email verification, input sanitization

## 10. Emergency Procedures

### In Case of Security Breach:

1. **Immediate Actions:**
   - Disable affected edge functions in `config.toml`
   - Rotate all API keys and secrets
   - Review recent database changes
   - Check edge function logs

2. **Database Restoration:**
   - List available backups from `database-backups` bucket
   - Choose appropriate backup file
   - Call `restore-backup` function with admin JWT
   - Verify data integrity

3. **Post-Incident:**
   - Review security logs
   - Update security policies
   - Notify affected users if necessary
   - Document incident and response

## Support

For security concerns or questions, review the implementation in:
- Edge functions: `supabase/functions/`
- Validation middleware: `supabase/functions/_shared/validation.ts`
- Admin login: `src/pages/AdminLogin.tsx`
- CSP headers: `index.html`
