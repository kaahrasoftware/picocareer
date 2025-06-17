
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user from the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.log('No authenticated user found');
      return new Response(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { referralCode } = await req.json();
    
    if (!referralCode) {
      return new Response(
        JSON.stringify({ success: false, message: 'Referral code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing referral code ${referralCode} for user ${user.id}`);

    // Check if user already has a referral record
    const { data: existingReferral, error: checkError } = await supabaseClient
      .from('user_referrals')
      .select('id')
      .eq('referred_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing referral:', checkError);
      return new Response(
        JSON.stringify({ success: false, message: 'Error checking referral status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingReferral) {
      console.log('User already has a referral record');
      return new Response(
        JSON.stringify({ success: false, message: 'User already has been referred' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the referrer by referral code
    const { data: referralCodeRecord, error: codeError } = await supabaseClient
      .from('referral_codes')
      .select('profile_id')
      .eq('referral_code', referralCode)
      .eq('is_active', true)
      .maybeSingle();

    if (codeError) {
      console.error('Error finding referral code:', codeError);
      return new Response(
        JSON.stringify({ success: false, message: 'Error validating referral code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!referralCodeRecord) {
      console.log('Invalid or inactive referral code:', referralCode);
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid referral code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const referrerId = referralCodeRecord.profile_id;

    // Prevent self-referral
    if (referrerId === user.id) {
      console.log('Self-referral attempt blocked');
      return new Response(
        JSON.stringify({ success: false, message: 'Cannot refer yourself' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the referral using the database function
    const { data: result, error: processError } = await supabaseClient
      .rpc('process_referral_reward', {
        p_referred_id: user.id,
        p_referral_code: referralCode
      });

    if (processError) {
      console.error('Error processing referral reward:', processError);
      return new Response(
        JSON.stringify({ success: false, message: 'Error processing referral reward' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Referral processing result:', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Referral processed successfully',
        result: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-referral-code function:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
