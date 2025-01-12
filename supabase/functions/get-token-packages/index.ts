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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Fetching Stripe products...');

    // Fetch all active products with their prices
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

    return new Response(
      JSON.stringify(tokenPackages),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});