
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Generate API key
function generateApiKey(): string {
  return 'sk_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Create organization
async function createOrganization(data: any) {
  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name: data.name,
      description: data.description,
      website: data.website,
      contact_email: data.contact_email,
      industry: data.industry,
      size: data.size,
      settings: data.settings || {},
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return org;
}

// Create API key for organization
async function createApiKey(orgId: string, data: any) {
  const apiKey = generateApiKey();
  
  const { data: key, error } = await supabase
    .from('organization_api_keys')
    .insert({
      organization_id: orgId,
      api_key: apiKey,
      name: data.name,
      permissions: data.permissions || ['chat', 'search'],
      rate_limit_per_minute: data.rate_limit_per_minute || 60,
      is_active: true,
      usage_count: 0,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return key;
}

// Get organization details
async function getOrganization(orgId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      *,
      organization_api_keys:organization_api_keys(
        id, name, permissions, rate_limit_per_minute, 
        is_active, usage_count, last_used_at, created_at
      )
    `)
    .eq('id', orgId)
    .single();

  if (error) throw error;
  return data;
}

// Update organization settings
async function updateOrganization(orgId: string, updates: any) {
  const { data, error } = await supabase
    .from('organizations')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', orgId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Deactivate API key
async function deactivateApiKey(keyId: string) {
  const { data, error } = await supabase
    .from('organization_api_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  try {
    // Basic auth check for admin operations
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let responseData: any;
    let statusCode = 200;

    if (path === '/org-management/organizations' && method === 'POST') {
      const body = await req.json();
      responseData = await createOrganization(body);
      statusCode = 201;

    } else if (path.match(/\/org-management\/organizations\/([^\/]+)$/) && method === 'GET') {
      const orgId = path.split('/')[3];
      responseData = await getOrganization(orgId);

    } else if (path.match(/\/org-management\/organizations\/([^\/]+)$/) && method === 'PUT') {
      const orgId = path.split('/')[3];
      const body = await req.json();
      responseData = await updateOrganization(orgId, body);

    } else if (path.match(/\/org-management\/organizations\/([^\/]+)\/api-keys/) && method === 'POST') {
      const orgId = path.split('/')[3];
      const body = await req.json();
      responseData = await createApiKey(orgId, body);
      statusCode = 201;

    } else if (path.match(/\/org-management\/api-keys\/([^\/]+)\/deactivate/) && method === 'POST') {
      const keyId = path.split('/')[3];
      responseData = await deactivateApiKey(keyId);

    } else {
      return new Response(
        JSON.stringify({ error: 'Endpoint not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ data: responseData, success: true }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Management API Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
