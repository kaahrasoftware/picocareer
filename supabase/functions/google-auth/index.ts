import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { OAuth2Client } from 'https://deno.land/x/oauth2_client@v1.0.2/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REDIRECT_URL = Deno.env.get('REDIRECT_URL') || 'http://localhost:5173/auth/callback'

// Initialize the OAuth 2.0 client
const oauth2Client = new OAuth2Client({
  clientId: Deno.env.get('GOOGLE_CLIENT_ID') || '',
  clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
  authorizationEndpointUri: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUri: 'https://oauth2.googleapis.com/token',
  redirectUri: REDIRECT_URL,
  defaults: {
    scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
  },
})

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (action === 'authorize') {
      // Generate authorization URL
      const { uri } = await oauth2Client.code.getAuthorizationUri()
      return new Response(JSON.stringify({ url: uri }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'callback') {
      // Handle the OAuth callback
      const code = url.searchParams.get('code')
      if (!code) {
        throw new Error('No code provided')
      }

      // Exchange the authorization code for tokens
      const tokens = await oauth2Client.code.getToken(req.url)
      
      // Store the tokens in the database for the user
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        throw new Error('No authorization header')
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )

      if (authError || !user) {
        throw new Error('Invalid user token')
      }

      // Store the tokens in a secure table
      const { error: insertError } = await supabase
        .from('user_oauth_tokens')
        .upsert({
          user_id: user.id,
          provider: 'google',
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_at: new Date(Date.now() + (tokens.expiresIn || 3600) * 1000).toISOString(),
        })

      if (insertError) {
        throw new Error('Failed to store tokens')
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})