
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Deno-compatible webhook signature verification
async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const elements = signature.split(',');
    let timestamp = '';
    let v1 = '';
    
    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'v1') {
        v1 = value;
      }
    }
    
    if (!timestamp || !v1) {
      console.error('Missing timestamp or signature in header');
      return false;
    }
    
    // Create the payload string
    const payload = `${timestamp}.${body}`;
    
    // Create HMAC using Deno's crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature_bytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expected_signature = Array.from(new Uint8Array(signature_bytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Compare signatures
    return expected_signature === v1;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_API');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Webhook received - checking environment variables...');

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      console.error('stripeKey:', !!stripeKey, 'webhookSecret:', !!webhookSecret, 'supabaseUrl:', !!supabaseUrl, 'supabaseServiceKey:', !!supabaseServiceKey);
      throw new Error('Missing required environment variables');
    }

    console.log('Environment variables verified');

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    console.log('Request body length:', body.length);
    console.log('Signature header present:', !!signature);

    if (!signature) {
      console.error('No stripe signature found');
      throw new Error('No stripe signature found');
    }

    // Verify the webhook signature using our Deno-compatible method
    const isValidSignature = await verifyWebhookSignature(body, signature, webhookSecret);
    
    if (!isValidSignature) {
      console.error('Webhook signature verification failed');
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log('Webhook signature verified successfully');

    // Parse the event
    let event: Stripe.Event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('Error parsing webhook body:', err);
      return new Response('Invalid JSON', { status: 400 });
    }

    console.log('Webhook event type:', event.type);
    console.log('Event ID:', event.id);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Processing checkout session:', session.id);
      console.log('Session metadata:', session.metadata);

      // Get the price ID and user ID from metadata
      const priceId = session.metadata?.price_id;
      const userId = session.metadata?.user_id;

      if (!priceId || !userId) {
        console.error('Missing price_id or user_id in session metadata');
        console.error('Available metadata:', session.metadata);
        return new Response('Missing required metadata', { status: 400 });
      }

      console.log('Processing payment for user:', userId, 'with price:', priceId);

      // Get the token package details from the database
      const { data: tokenPackage, error: packageError } = await supabase
        .from('token_packages')
        .select('*')
        .eq('default_price', priceId)
        .eq('is_active', true)
        .single();

      if (packageError || !tokenPackage) {
        console.error('Token package not found for price:', priceId);
        console.error('Package error:', packageError);
        return new Response('Token package not found', { status: 404 });
      }

      console.log('Found token package:', tokenPackage.name, 'with', tokenPackage.token_amount, 'tokens');

      // Get or create user's wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('profile_id', userId)
        .single();

      if (walletError && walletError.code !== 'PGRST116') {
        console.error('Error fetching wallet:', walletError);
        return new Response('Error fetching wallet', { status: 500 });
      }

      let walletId = wallet?.id;

      // Create wallet if it doesn't exist
      if (!wallet) {
        console.log('Creating new wallet for user:', userId);
        const { data: newWallet, error: createWalletError } = await supabase
          .from('wallets')
          .insert({ profile_id: userId, balance: 0 })
          .select()
          .single();

        if (createWalletError) {
          console.error('Error creating wallet:', createWalletError);
          return new Response('Error creating wallet', { status: 500 });
        }

        walletId = newWallet.id;
        console.log('Created new wallet with ID:', walletId);
      }

      // Use the credit_tokens RPC function for atomic transaction
      console.log('Crediting tokens using RPC function...');
      
      const { data: creditResult, error: creditError } = await supabase.rpc('credit_tokens', {
        p_wallet_id: walletId,
        p_amount: tokenPackage.token_amount,
        p_description: `Purchase: ${tokenPackage.name}`,
        p_reference_id: session.id,
        p_metadata: {
          stripe_session_id: session.id,
          package_name: tokenPackage.name,
          package_id: tokenPackage.id,
          price_id: priceId,
          amount_paid: session.amount_total ? session.amount_total / 100 : tokenPackage.price_usd,
          currency: session.currency || 'usd',
          payment_method: session.payment_method_types?.[0] || 'card'
        }
      });

      if (creditError) {
        console.error('Error crediting tokens:', creditError);
        return new Response('Error crediting tokens', { status: 500 });
      }

      if (!creditResult?.success) {
        console.error('Token credit failed:', creditResult?.message);
        return new Response('Token credit failed', { status: 500 });
      }

      console.log(`✅ Successfully credited ${tokenPackage.token_amount} tokens to user ${userId}`);
      console.log(`💰 New wallet balance: ${creditResult.new_balance} tokens`);
      console.log(`📝 Transaction ID: ${creditResult.transaction_id}`);
    } else {
      console.log('Webhook event type not handled:', event.type);
    }

    return new Response('OK', { 
      headers: corsHeaders,
      status: 200 
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
