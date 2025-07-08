import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrgRequest {
  name: string;
  domain?: string;
  hub_id?: string;
  subscription_tier?: 'free' | 'basic' | 'professional' | 'enterprise';
  contact_email: string;
  contact_name?: string;
  phone?: string;
  billing_address?: object;
  settings?: object;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify admin access
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader);
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'editor'].includes(profile.user_type)) {
      throw new Error('Insufficient permissions');
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const orgId = pathSegments[pathSegments.length - 1];

    switch (req.method) {
      case 'GET':
        if (orgId && orgId !== 'api-organizations') {
          // Get single organization
          const { data: organization, error } = await supabaseClient
            .from('api_organizations')
            .select('*')
            .eq('id', orgId)
            .single();

          if (error) throw error;

          return new Response(JSON.stringify(organization), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all organizations
          const { data: organizations, error } = await supabaseClient
            .from('api_organizations')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify(organizations), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        const createData: CreateOrgRequest = await req.json();
        
        const { data: newOrg, error: createError } = await supabaseClient
          .from('api_organizations')
          .insert({
            name: createData.name,
            domain: createData.domain,
            hub_id: createData.hub_id,
            subscription_tier: createData.subscription_tier || 'free',
            contact_email: createData.contact_email,
            contact_name: createData.contact_name,
            phone: createData.phone,
            billing_address: createData.billing_address || {},
            settings: createData.settings || {},
          })
          .select()
          .single();

        if (createError) throw createError;

        // Create default quotas for new organization
        const defaultQuotas = [
          { quota_type: 'requests', period_type: 'monthly', limit_value: 1000 },
          { quota_type: 'assessments', period_type: 'monthly', limit_value: 100 },
        ];

        for (const quota of defaultQuotas) {
          await supabaseClient
            .from('api_quotas')
            .insert({
              organization_id: newOrg.id,
              ...quota,
            });
        }

        console.log('Created new organization:', newOrg.id);

        return new Response(JSON.stringify(newOrg), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        if (!orgId || orgId === 'api-organizations') {
          throw new Error('Organization ID required for update');
        }

        const updateData = await req.json();
        
        const { data: updatedOrg, error: updateError } = await supabaseClient
          .from('api_organizations')
          .update(updateData)
          .eq('id', orgId)
          .select()
          .single();

        if (updateError) throw updateError;

        console.log('Updated organization:', orgId);

        return new Response(JSON.stringify(updatedOrg), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        if (!orgId || orgId === 'api-organizations') {
          throw new Error('Organization ID required for deletion');
        }

        const { error: deleteError } = await supabaseClient
          .from('api_organizations')
          .delete()
          .eq('id', orgId);

        if (deleteError) throw deleteError;

        console.log('Deleted organization:', orgId);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Method ${req.method} not allowed`);
    }

  } catch (error) {
    console.error('Error in api-organizations function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'ORGANIZATION_API_ERROR'
      }), 
      {
        status: error.message.includes('permissions') || error.message.includes('authentication') ? 403 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});