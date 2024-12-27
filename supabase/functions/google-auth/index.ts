import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { OAuth2Client } from 'https://deno.land/x/oauth2_client@v1.0.2/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const REDIRECT_URL = Deno.env.get('REDIRECT_URL') || 'http://localhost:5173/auth/callback'
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing required Google OAuth credentials')
}

console.log('Starting Google OAuth Edge Function')
console.log('Redirect URL:', REDIRECT_URL)

// Initialize the OAuth 2.0 client with basic scopes
const oauth2Client = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  authorizationEndpointUri: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUri: 'https://oauth2.googleapis.com/token',
  redirectUri: REDIRECT_URL,
  defaults: {
    scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
  },
})

serve(async (req) => {
  console.log('Received request:', req.method, req.url)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, userId } = await req.json()
    console.log('Request payload:', { action, userId })

    if (!action) {
      throw new Error('Action is required')
    }

    if (action === 'authorize') {
      console.log('Processing authorize action')
      // Generate authorization URL with all required scopes
      const { uri } = await oauth2Client.code.getAuthorizationUri({
        scope: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ],
        state: JSON.stringify({ action: 'authorize', userId }),
        access_type: 'offline',
        prompt: 'consent',
      })
      
      console.log('Generated auth URI:', uri)
      return new Response(JSON.stringify({ url: uri }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'disconnect') {
      console.log('Processing disconnect action for user:', userId)
      if (!userId) {
        throw new Error('User ID is required for disconnection')
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { error: deleteError } = await supabase
        .from('user_oauth_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('provider', 'google')

      if (deleteError) throw deleteError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'callback') {
      console.log('Processing callback action')
      const code = new URL(req.url).searchParams.get('code')
      if (!code) {
        throw new Error('No code provided')
      }

      console.log('Exchanging code for tokens')
      const tokens = await oauth2Client.code.getToken(req.url)
      console.log('Tokens received')

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

      console.log('Storing tokens for user:', user.id)
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
    console.error('Error in Edge Function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})