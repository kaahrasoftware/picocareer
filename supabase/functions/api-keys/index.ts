import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateKeyRequest {
  organization_id: string;
  key_name: string;
  environment?: 'production' | 'sandbox';
  rate_limit_per_minute?: number;
  rate_limit_per_day?: number;
  expires_at?: string;
  permissions?: object;
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

    // Verify admin access using user client
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const keyId = pathSegments[pathSegments.length - 1];

    // Handle method override for PUT requests from frontend
    let method = req.method;
    if (req.method === 'POST') {
      try {
        const body = await req.clone().json();
        if (body._method === 'PUT') {
          method = 'PUT';
        }
      } catch (e) {
        // Not JSON or no _method, continue with POST
      }
    }

    switch (method) {
      case 'GET':
        const orgId = url.searchParams.get('organization_id');
        
        console.log('GET API Keys request started');
        console.log('User ID:', user.id);
        console.log('User email:', user.email);
        console.log('Organization ID filter:', orgId);
        console.log('Key ID:', keyId);
        
        // First, verify user's role from profiles table
        try {
          const { data: profile, error: profileError } = await userClient
            .from('profiles')
            .select('user_type, email')
            .eq('id', user.id)
            .single();
          
          console.log('User profile query result:', { profile, error: profileError });
          
          if (profileError) {
            console.error('Failed to fetch user profile:', profileError);
            throw new Error(`Profile fetch failed: ${profileError.message}`);
          }
          
          if (!profile || !['admin', 'editor'].includes(profile.user_type)) {
            console.error('User lacks required permissions:', profile);
            throw new Error('Insufficient permissions - admin or editor role required');
          }
          
          console.log('User permissions verified:', profile.user_type);
        } catch (profileError) {
          console.error('Profile verification failed:', profileError);
          throw profileError;
        }

        // Test simple API keys query first (without join)
        console.log('Testing simple API keys query without join...');
        try {
          const { data: simpleKeys, error: simpleError } = await userClient
            .from('api_keys')
            .select('id, key_name, organization_id')
            .limit(1);
          
          console.log('Simple query result:', { count: simpleKeys?.length, error: simpleError });
          
          if (simpleError) {
            console.error('Simple query failed:', simpleError);
            throw new Error(`Simple API keys query failed: ${simpleError.message}`);
          }
        } catch (simpleQueryError) {
          console.error('Simple query threw exception:', simpleQueryError);
          throw simpleQueryError;
        }

        // Now try the full query with join
        console.log('Attempting full query with organization join...');
        let query = userClient
          .from('api_keys')
          .select(`
            id,
            organization_id,
            key_name,
            key_prefix,
            environment,
            rate_limit_per_minute,
            rate_limit_per_day,
            expires_at,
            is_active,
            last_used_at,
            created_at,
            permissions,
            api_organizations!inner(name)
          `);

        if (keyId && keyId !== 'api-keys') {
          console.log('Fetching single API key:', keyId);
          query = query.eq('id', keyId);
          
          try {
            const { data: apiKey, error } = await query.single();
            console.log('Single key query result:', { data: !!apiKey, error });
            
            if (error) {
              console.error('Single key query error:', error);
              throw error;
            }
            
            return new Response(JSON.stringify(apiKey), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } catch (singleKeyError) {
            console.error('Single key query failed:', singleKeyError);
            throw singleKeyError;
          }
        } else {
          console.log('Fetching all API keys...');
          
          if (orgId) {
            console.log('Filtering by organization:', orgId);
            query = query.eq('organization_id', orgId);
          }
          
          try {
            const { data: apiKeys, error } = await query.order('created_at', { ascending: false });
            console.log('All keys query result:', { count: apiKeys?.length, error });
            
            if (error) {
              console.error('All keys query error:', error);
              throw error;
            }
            
            console.log('Successfully fetched API keys:', apiKeys?.length || 0);
            return new Response(JSON.stringify(apiKeys), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } catch (allKeysError) {
            console.error('All keys query failed:', allKeysError);
            throw allKeysError;
          }
        }
        break;

      case 'POST':
        let createData: CreateKeyRequest;
        try {
          createData = await req.json();
        } catch (error) {
          throw new Error('Invalid JSON in request body');
        }
        
        // Generate API key using the database function
        const { data: generatedKey } = await supabaseClient.rpc('generate_api_key');
        
        if (!generatedKey) {
          throw new Error('Failed to generate API key');
        }

        // Hash the key for storage
        const encoder = new TextEncoder();
        const data = encoder.encode(generatedKey);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const { data: newKey, error: createError } = await userClient
          .from('api_keys')
          .insert({
            organization_id: createData.organization_id,
            key_name: createData.key_name,
            key_hash: keyHash,
            key_prefix: generatedKey.substring(0, 7), // Store first 7 chars for identification
            environment: createData.environment || 'production',
            rate_limit_per_minute: createData.rate_limit_per_minute || 60,
            rate_limit_per_day: createData.rate_limit_per_day || 1000,
            expires_at: createData.expires_at,
            permissions: createData.permissions || {},
            created_by: user.id,
          })
          .select(`
            id,
            organization_id,
            key_name,
            key_prefix,
            environment,
            rate_limit_per_minute,
            rate_limit_per_day,
            expires_at,
            is_active,
            created_at,
            permissions
          `)
          .single();

        if (createError) throw createError;

        console.log('Created new API key:', newKey.id, 'for organization:', createData.organization_id);

        // Return the full key only once (for the client to store securely)
        return new Response(JSON.stringify({
          ...newKey,
          api_key: generatedKey, // This is the only time the full key is returned
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        let updateData;
        try {
          updateData = await req.json();
        } catch (error) {
          throw new Error('Invalid JSON in request body');
        }

        // Get keyId from request body for PUT operations
        const updateKeyId = updateData.id;
        if (!updateKeyId) {
          throw new Error('API key ID required for update');
        }
        
        // Don't allow updating the actual key or hash
        const allowedUpdates = {
          key_name: updateData.key_name,
          is_active: updateData.is_active,
          rate_limit_per_minute: updateData.rate_limit_per_minute,
          rate_limit_per_day: updateData.rate_limit_per_day,
          expires_at: updateData.expires_at,
          permissions: updateData.permissions,
        };

        const { data: updatedKey, error: updateError } = await userClient
          .from('api_keys')
          .update(allowedUpdates)
          .eq('id', updateKeyId)
          .select()
          .single();

        if (updateError) throw updateError;

        console.log('Updated API key:', keyId);

        return new Response(JSON.stringify(updatedKey), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        if (!keyId || keyId === 'api-keys') {
          throw new Error('API key ID required for deletion');
        }

        const { error: deleteError } = await userClient
          .from('api_keys')
          .delete()
          .eq('id', keyId);

        if (deleteError) throw deleteError;

        console.log('Deleted API key:', keyId);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Method ${req.method} not allowed`);
    }

  } catch (error) {
    console.error('Error in api-keys function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'API_KEYS_ERROR'
      }), 
      {
        status: error.message.includes('permissions') || error.message.includes('authentication') ? 403 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});