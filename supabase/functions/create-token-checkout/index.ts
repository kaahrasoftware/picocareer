
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!stripeKey) {
      console.error('STRIPE_API is not configured in edge function secrets');
      throw new Error('Stripe API key is not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration is missing');
      throw new Error('Supabase configuration is missing');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const { priceId, promotionCode } = await req.json();

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Extract JWT token and get user ID
    const jwt = authHeader.replace('Bearer ', '');
    
    // Parse the JWT to get user ID (basic parsing)
    let userId;
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      userId = payload.sub;
      
      if (!userId) {
        throw new Error('No user ID found in JWT');
      }
    } catch (jwtError) {
      console.error('Error parsing JWT:', jwtError);
      throw new Error('Invalid JWT token');
    }

    console.log('Creating checkout session for user:', userId, 'with price:', priceId);
    
    // Create checkout session with user ID in metadata
    const sessionConfig: any = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/profile?tab=wallet&success=true`,
      cancel_url: `${req.headers.get('origin')}/token-shop`,
      allow_promotion_codes: true,
      metadata: {
        user_id: userId,
        price_id: priceId,
      },
    };

    // Add promotion code if provided
    if (promotionCode) {
      try {
        // Check if the promotion code exists
        const promotionCodes = await stripe.promotionCodes.list({
          code: promotionCode,
          active: true,
          limit: 1,
        });
        
        if (promotionCodes.data.length > 0) {
          sessionConfig.discounts = [{
            promotion_code: promotionCodes.data[0].id,
          }];
          console.log('Applied promotion code:', promotionCode);
        } else {
          console.log('Promotion code not found or inactive:', promotionCode);
        }
      } catch (promoError) {
        console.error('Error applying promotion code:', promoError);
        // Continue without the promotion code rather than failing
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Checkout session created successfully:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
