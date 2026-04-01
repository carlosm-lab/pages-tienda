import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CRIT-S01: Restrict CORS to production domain only — wildcard '*' allowed any site to abuse this endpoint
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://pagesdetallesymas.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // HIGH-001: Validate authentication — reject unauthenticated requests to prevent abuse
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token } = await req.json()

    // HIGH-S03: Fail fast if server secret is not configured — prevents silent failures with Cloudflare
    const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
    if (!secret) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server misconfigured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token is missing' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formData = new FormData()
    formData.append('secret', secret)
    formData.append('response', token)

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: formData,
      method: 'POST',
    })

    const outcome = await result.json()

    if (!outcome.success) {
      return new Response(
        JSON.stringify({ success: false, error: "Validation failed" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
