
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_API');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      throw new Error('Missing required environment variables');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('No stripe signature found');
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log('Webhook event type:', event.type);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Processing checkout session:', session.id);
      console.log('Session metadata:', session.metadata);

      // Get the price ID and JWT from metadata
      const priceId = session.metadata?.price_id;
      const userJwt = session.metadata?.user_jwt;

      if (!priceId || !userJwt) {
        console.error('Missing price_id or user_jwt in session metadata');
        return new Response('Missing required metadata', { status: 400 });
      }

      // Parse the JWT to get user ID (basic parsing - in production use proper JWT library)
      try {
        const payload = JSON.parse(atob(userJwt.split('.')[1]));
        const userId = payload.sub;

        if (!userId) {
          throw new Error('No user ID found in JWT');
        }

        console.log('Processing payment for user:', userId);

        // Get the token package details from the database
        const { data: tokenPackage, error: packageError } = await supabase
          .from('token_packages')
          .select('*')
          .eq('default_price', priceId)
          .eq('is_active', true)
          .single();

        if (packageError || !tokenPackage) {
          console.error('Token package not found:', packageError);
          return new Response('Token package not found', { status: 404 });
        }

        console.log('Found token package:', tokenPackage);

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
        }

        // Update wallet balance
        const { error: updateError } = await supabase
          .from('wallets')
          .update({ 
            balance: (wallet?.balance || 0) + tokenPackage.token_amount,
            updated_at: new Date().toISOString()
          })
          .eq('profile_id', userId);

        if (updateError) {
          console.error('Error updating wallet balance:', updateError);
          return new Response('Error updating wallet balance', { status: 500 });
        }

        // Record the transaction
        const { error: transactionError } = await supabase
          .from('token_transactions')
          .insert({
            wallet_id: walletId,
            transaction_type: 'credit',
            amount: tokenPackage.token_amount,
            description: `Purchase: ${tokenPackage.name}`,
            related_entity_type: 'stripe_session',
            related_entity_id: session.id
          });

        if (transactionError) {
          console.error('Error recording transaction:', transactionError);
          return new Response('Error recording transaction', { status: 500 });
        }

        console.log(`Successfully credited ${tokenPackage.token_amount} tokens to user ${userId}`);

      } catch (jwtError) {
        console.error('Error parsing JWT:', jwtError);
        return new Response('Invalid JWT', { status: 400 });
      }
    }

    return new Response('OK', { 
      headers: corsHeaders,
      status: 200 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
