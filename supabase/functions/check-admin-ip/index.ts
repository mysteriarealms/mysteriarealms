// deno-lint-ignore-file no-import-prefix
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract IP address from headers (Cloudflare, nginx, or standard forwarding)
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    const xRealIp = req.headers.get('x-real-ip');
    const xForwardedFor = req.headers.get('x-forwarded-for');
    
    const clientIp = cfConnectingIp || 
                     xRealIp || 
                     (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null);

    console.log('IP Check - Client IP:', clientIp);

    if (!clientIp) {
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          message: 'Unable to determine IP address',
          ip: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create Supabase client with service role for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if IP is whitelisted
    const { data: isWhitelisted, error } = await supabase.rpc('is_ip_whitelisted', {
      check_ip: clientIp
    });

    if (error) {
      console.error('Error checking IP whitelist:', error);
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          message: 'Error checking IP whitelist',
          ip: clientIp
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('IP Check Result:', { ip: clientIp, isWhitelisted });

    return new Response(
      JSON.stringify({ 
        allowed: isWhitelisted === true,
        ip: clientIp,
        message: isWhitelisted 
          ? 'IP address is whitelisted' 
          : 'IP address is not whitelisted'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in check-admin-ip function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        allowed: false, 
        message: 'Internal server error',
        error: errorMessage 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
