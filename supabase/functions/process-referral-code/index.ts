
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
    console.log('=== REFERRAL CODE PROCESSING START ===');
    
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
      console.log('Authentication failed:', userError);
      return new Response(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const requestBody = await req.json();
    const { referralCode } = requestBody;
    
    if (!referralCode) {
      console.log('No referral code provided');
      return new Response(
        JSON.stringify({ success: false, message: 'Referral code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean and normalize the referral code
    const cleanReferralCode = referralCode.toString().trim().toUpperCase();
    console.log(`Processing referral code "${cleanReferralCode}" for user ${user.id}`);

    // Check if user already has a referral record
    console.log('Checking for existing referral...');
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
        JSON.stringify({ success: false, message: 'You have already been referred by someone' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Debug: Check what referral codes exist
    console.log('Fetching all active referral codes for debugging...');
    const { data: allCodes, error: debugError } = await supabaseClient
      .from('referral_codes')
      .select('referral_code, is_active, profile_id')
      .eq('is_active', true);
    
    if (debugError) {
      console.error('Error fetching debug codes:', debugError);
    } else {
      console.log('Available active referral codes:', allCodes?.map(c => ({ 
        code: c.referral_code, 
        profile_id: c.profile_id 
      })));
    }
    
    // Find the referrer by referral code
    console.log(`Looking up referral code: "${cleanReferralCode}"`);
    const { data: referralCodeRecord, error: codeError } = await supabaseClient
      .from('referral_codes')
      .select('profile_id, referral_code')
      .eq('referral_code', cleanReferralCode)
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
      console.log(`Invalid or inactive referral code: "${cleanReferralCode}"`);
      console.log('Available codes for comparison:', allCodes?.map(c => c.referral_code).join(', '));
      
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid or inactive referral code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const referrerId = referralCodeRecord.profile_id;
    console.log(`Found referrer: ${referrerId} for code: ${referralCodeRecord.referral_code}`);

    // Prevent self-referral
    if (referrerId === user.id) {
      console.log('Self-referral attempt blocked');
      return new Response(
        JSON.stringify({ success: false, message: 'You cannot refer yourself' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the referral using the database function
    console.log(`Calling process_referral_reward for user ${user.id} with code ${cleanReferralCode}`);
    const { data: result, error: processError } = await supabaseClient
      .rpc('process_referral_reward', {
        p_referred_id: user.id,
        p_referral_code: cleanReferralCode
      });

    if (processError) {
      console.error('Error processing referral reward:', processError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Error processing referral reward',
          details: processError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Referral processing result:', result);

    // Check if the result indicates success
    if (result && typeof result === 'object' && result.success === false) {
      console.log('Referral processing failed:', result.message);
      return new Response(
        JSON.stringify({
          success: false,
          message: result.message || 'Failed to process referral'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('=== REFERRAL CODE PROCESSING SUCCESS ===');
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Referral processed successfully! Both you and your friend have earned 15 tokens.',
        result: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== REFERRAL CODE PROCESSING ERROR ===');
    console.error('Error in process-referral-code function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
