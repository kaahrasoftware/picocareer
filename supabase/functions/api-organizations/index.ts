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

    // Since verify_jwt = true in config.toml, we can use the service role client
    // and rely on RLS policies for authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create user client with the JWT token for RLS
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Verify admin access using user client (this will respect RLS)
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const orgId = pathSegments[pathSegments.length - 1];

    switch (req.method) {
      case 'GET':
        if (orgId && orgId !== 'api-organizations') {
          // Get single organization using user client (RLS will apply)
          const { data: organization, error } = await userClient
            .from('api_organizations')
            .select('*')
            .eq('id', orgId)
            .single();

          if (error) throw error;

          return new Response(JSON.stringify(organization), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all organizations using user client (RLS will apply)
          const { data: organizations, error } = await userClient
            .from('api_organizations')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify(organizations), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        let createData: CreateOrgRequest;
        try {
          createData = await req.json();
        } catch (error) {
          throw new Error('Invalid JSON in request body');
        }
        
        // Validate required fields
        if (!createData.name?.trim()) {
          throw new Error('Organization name is required');
        }
        if (!createData.contact_email?.trim()) {
          throw new Error('Contact email is required');
        }
        
        // Prepare data with proper null handling for optional fields
        const insertData = {
          name: createData.name.trim(),
          domain: createData.domain?.trim() || null,
          hub_id: createData.hub_id?.trim() || null,
          subscription_tier: createData.subscription_tier || 'free',
          contact_email: createData.contact_email.trim(),
          contact_name: createData.contact_name?.trim() || null,
          phone: createData.phone?.trim() || null,
          billing_address: createData.billing_address || {},
          settings: createData.settings || {},
        };
        
        // Use user client for insert (RLS will apply)
        const { data: newOrg, error: createError } = await userClient
          .from('api_organizations')
          .insert(insertData)
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

        let updateDataRaw: Partial<CreateOrgRequest>;
        try {
          updateDataRaw = await req.json();
        } catch (error) {
          throw new Error('Invalid JSON in request body');
        }
        
        console.log('Raw update data received:', updateDataRaw);
        
        // Validate and clean update data (same logic as POST)
        const cleanedUpdateData: any = {};
        
        if (updateDataRaw.name !== undefined) {
          if (!updateDataRaw.name?.trim()) {
            throw new Error('Organization name cannot be empty');
          }
          cleanedUpdateData.name = updateDataRaw.name.trim();
        }
        
        if (updateDataRaw.contact_email !== undefined) {
          if (!updateDataRaw.contact_email?.trim()) {
            throw new Error('Contact email cannot be empty');
          }
          cleanedUpdateData.contact_email = updateDataRaw.contact_email.trim();
        }
        
        // Handle optional fields with proper null conversion
        if (updateDataRaw.domain !== undefined) {
          cleanedUpdateData.domain = updateDataRaw.domain?.trim() || null;
        }
        
        if (updateDataRaw.hub_id !== undefined) {
          cleanedUpdateData.hub_id = updateDataRaw.hub_id?.trim() || null;
        }
        
        if (updateDataRaw.subscription_tier !== undefined) {
          cleanedUpdateData.subscription_tier = updateDataRaw.subscription_tier || 'free';
        }
        
        if (updateDataRaw.contact_name !== undefined) {
          cleanedUpdateData.contact_name = updateDataRaw.contact_name?.trim() || null;
        }
        
        if (updateDataRaw.phone !== undefined) {
          cleanedUpdateData.phone = updateDataRaw.phone?.trim() || null;
        }
        
        if (updateDataRaw.billing_address !== undefined) {
          cleanedUpdateData.billing_address = updateDataRaw.billing_address || {};
        }
        
        if (updateDataRaw.settings !== undefined) {
          cleanedUpdateData.settings = updateDataRaw.settings || {};
        }
        
        console.log('Cleaned update data:', cleanedUpdateData);
        
        const { data: updatedOrg, error: updateError } = await userClient
          .from('api_organizations')
          .update(cleanedUpdateData)
          .eq('id', orgId)
          .select()
          .single();

        if (updateError) {
          console.error('Database update error:', updateError);
          throw updateError;
        }

        console.log('Updated organization successfully:', orgId);

        return new Response(JSON.stringify(updatedOrg), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        if (!orgId || orgId === 'api-organizations') {
          throw new Error('Organization ID required for deletion');
        }

        const { error: deleteError } = await userClient
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