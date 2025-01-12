import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    const stripe = new Stripe(Deno.env.get('STRIPE_API') || '', {
      apiVersion: '2023-10-16',
    });

    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    // Get the raw body
    const body = await req.text();
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK') || ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Received Stripe webhook event:', event.type);

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing successful payment:', session.id);

      // Initialize Supabase client
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      // Get user ID from metadata
      const userId = session.metadata?.userId;
      if (!userId) {
        throw new Error('No user ID found in session metadata');
      }

      // Get the price ID from the line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;
      if (!priceId) {
        throw new Error('No price ID found in session');
      }

      // Get token package details
      const { data: tokenPackage, error: tokenPackageError } = await supabaseClient
        .from('token_packages')
        .select('*')
        .eq('default_price', priceId)
        .single();

      if (tokenPackageError || !tokenPackage) {
        throw new Error('Token package not found');
      }

      // Get user's wallet
      const { data: wallet, error: walletError } = await supabaseClient
        .from('wallets')
        .select('*')
        .eq('profile_id', userId)
        .single();

      if (walletError || !wallet) {
        throw new Error('Wallet not found');
      }

      // Call the function to add tokens
      const { error: addTokensError } = await supabaseClient.rpc(
        'add_tokens_to_wallet',
        {
          p_wallet_id: wallet.id,
          p_amount: tokenPackage.token_amount,
          p_description: `Purchase of ${tokenPackage.name}`,
          p_related_entity_type: 'stripe_payment',
          p_related_entity_id: null
        }
      );

      if (addTokensError) {
        throw addTokensError;
      }

      // Create a success notification for the user
      await supabaseClient.from('notifications').insert({
        profile_id: userId,
        title: 'Token Purchase Successful',
        message: `${tokenPackage.token_amount} tokens have been added to your wallet`,
        type: 'token_purchase',
      });

      console.log('Successfully processed payment and added tokens for user:', userId);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});