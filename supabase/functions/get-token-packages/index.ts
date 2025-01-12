import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY is not configured in edge function secrets');
      throw new Error('Stripe secret key is not configured');
    }

    console.log('Initializing Stripe client...');
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    console.log('Fetching active products from Stripe...');
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    console.log(`Found ${products.data.length} active products`);

    // Format the response
    const tokenPackages = products.data.map(product => {
      const price = product.default_price as Stripe.Price;
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price_usd: price.unit_amount ? price.unit_amount / 100 : 0,
        token_amount: parseInt(product.metadata.token_amount || '0'),
        default_price: price.id,
        image_url: product.images?.[0],
      };
    });

    console.log('Formatted token packages:', tokenPackages);

    return new Response(
      JSON.stringify(tokenPackages),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in get-token-packages function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});