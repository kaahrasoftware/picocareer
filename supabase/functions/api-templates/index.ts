import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateTemplateRequest {
  name: string;
  description?: string;
  organization_id: string;
  config: object;
  question_sets?: object[];
  branding?: object;
  scoring_logic?: object;
  target_audience?: string[];
  languages?: string[];
  estimated_duration_minutes?: number;
  max_retries?: number;
  session_timeout_minutes?: number;
  is_default?: boolean;
}

interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  config?: object;
  question_sets?: object[];
  branding?: object;
  scoring_logic?: object;
  target_audience?: string[];
  languages?: string[];
  estimated_duration_minutes?: number;
  max_retries?: number;
  session_timeout_minutes?: number;
  is_active?: boolean;
  is_default?: boolean;
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

    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const apiKey = authHeader.replace('Bearer ', '');
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const startTime = Date.now();

    // Validate API key and get organization
    const { data: orgId, error: validationError } = await supabaseClient.rpc('validate_api_key', {
      api_key: apiKey
    });

    if (validationError || !orgId) {
      // Log failed attempt
      await supabaseClient.rpc('log_api_usage', {
        p_organization_id: null,
        p_endpoint: req.url.split('?')[0],
        p_method: req.method,
        p_status_code: 401,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_error_message: 'Invalid API key'
      });

      throw new Error('Invalid API key');
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const templateId = pathSegments[pathSegments.length - 1];

    switch (req.method) {
      case 'GET':
        if (templateId && templateId !== 'api-templates') {
          // Get single template
          const { data: template, error } = await supabaseClient
            .from('api_assessment_templates')
            .select('*')
            .eq('id', templateId)
            .eq('organization_id', orgId)
            .single();

          if (error) throw error;

          // Log successful template fetch
          await supabaseClient.rpc('log_api_usage', {
            p_organization_id: orgId,
            p_endpoint: `/api/templates/${templateId}`,
            p_method: 'GET',
            p_status_code: 200,
            p_response_time_ms: Date.now() - startTime,
            p_ip_address: ipAddress,
            p_user_agent: userAgent
          });

          return new Response(JSON.stringify(template), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all templates for organization
          const { data: templates, error } = await supabaseClient
            .from('api_assessment_templates')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Log successful templates fetch
          await supabaseClient.rpc('log_api_usage', {
            p_organization_id: orgId,
            p_endpoint: '/api/templates',
            p_method: 'GET',
            p_status_code: 200,
            p_response_time_ms: Date.now() - startTime,
            p_ip_address: ipAddress,
            p_user_agent: userAgent
          });

          return new Response(JSON.stringify(templates), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        let createData: CreateTemplateRequest;
        try {
          createData = await req.json();
        } catch (error) {
          throw new Error('Invalid JSON in request body');
        }
        
        // Validate required fields
        if (!createData.name || !createData.organization_id || !createData.config) {
          throw new Error('Missing required fields: name, organization_id, config');
        }

        // Verify organization matches API key
        if (createData.organization_id !== orgId) {
          throw new Error('Organization ID mismatch');
        }

        // If this is set as default, unset other defaults
        if (createData.is_default) {
          await supabaseClient
            .from('api_assessment_templates')
            .update({ is_default: false })
            .eq('organization_id', orgId)
            .eq('is_default', true);
        }

        const { data: newTemplate, error: createError } = await supabaseClient
          .from('api_assessment_templates')
          .insert({
            organization_id: orgId,
            name: createData.name,
            description: createData.description,
            config: createData.config,
            question_sets: createData.question_sets || [],
            branding: createData.branding || {},
            scoring_logic: createData.scoring_logic || {},
            target_audience: createData.target_audience || [],
            languages: createData.languages || ['en'],
            estimated_duration_minutes: createData.estimated_duration_minutes || 15,
            max_retries: createData.max_retries || 3,
            session_timeout_minutes: createData.session_timeout_minutes || 60,
            is_default: createData.is_default || false,
            version: 1
          })
          .select()
          .single();

        if (createError) throw createError;

        // Log successful template creation
        await supabaseClient.rpc('log_api_usage', {
          p_organization_id: orgId,
          p_endpoint: '/api/templates',
          p_method: 'POST',
          p_status_code: 201,
          p_response_time_ms: Date.now() - startTime,
          p_ip_address: ipAddress,
          p_user_agent: userAgent
        });

        console.log('Created assessment template:', newTemplate.id, 'for organization:', orgId);

        return new Response(JSON.stringify(newTemplate), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        if (!templateId || templateId === 'api-templates') {
          throw new Error('Template ID required for update');
        }

        let updateData: UpdateTemplateRequest;
        try {
          updateData = await req.json();
        } catch (error) {
          throw new Error('Invalid JSON in request body');
        }

        // If setting as default, unset other defaults
        if (updateData.is_default) {
          await supabaseClient
            .from('api_assessment_templates')
            .update({ is_default: false })
            .eq('organization_id', orgId)
            .eq('is_default', true)
            .neq('id', templateId);
        }

        // Increment version number
        const { data: currentTemplate } = await supabaseClient
          .from('api_assessment_templates')
          .select('version')
          .eq('id', templateId)
          .eq('organization_id', orgId)
          .single();

        const { data: updatedTemplate, error: updateError } = await supabaseClient
          .from('api_assessment_templates')
          .update({
            ...updateData,
            version: (currentTemplate?.version || 1) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId)
          .eq('organization_id', orgId)
          .select()
          .single();

        if (updateError) throw updateError;

        // Log successful template update
        await supabaseClient.rpc('log_api_usage', {
          p_organization_id: orgId,
          p_endpoint: `/api/templates/${templateId}`,
          p_method: 'PUT',
          p_status_code: 200,
          p_response_time_ms: Date.now() - startTime,
          p_ip_address: ipAddress,
          p_user_agent: userAgent
        });

        console.log('Updated assessment template:', templateId);

        return new Response(JSON.stringify(updatedTemplate), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        if (!templateId || templateId === 'api-templates') {
          throw new Error('Template ID required for deletion');
        }

        // Check if template is being used by active sessions
        const { data: activeSessions } = await supabaseClient
          .from('api_assessment_sessions')
          .select('id')
          .eq('template_id', templateId)
          .eq('is_active', true)
          .limit(1);

        if (activeSessions && activeSessions.length > 0) {
          throw new Error('Cannot delete template with active sessions. Deactivate template instead.');
        }

        // Soft delete by deactivating
        const { data: deactivatedTemplate, error: deleteError } = await supabaseClient
          .from('api_assessment_templates')
          .update({ 
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId)
          .eq('organization_id', orgId)
          .select()
          .single();

        if (deleteError) throw deleteError;

        // Log successful template deletion
        await supabaseClient.rpc('log_api_usage', {
          p_organization_id: orgId,
          p_endpoint: `/api/templates/${templateId}`,
          p_method: 'DELETE',
          p_status_code: 200,
          p_response_time_ms: Date.now() - startTime,
          p_ip_address: ipAddress,
          p_user_agent: userAgent
        });

        console.log('Deactivated assessment template:', templateId);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Template deactivated successfully',
          template: deactivatedTemplate
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Method ${req.method} not allowed`);
    }

  } catch (error) {
    console.error('Error in api-templates function:', error);
    
    const statusCode = error.message.includes('Invalid API key') ? 401 : 
                      error.message.includes('not found') ? 404 :
                      error.message.includes('required') ? 400 : 500;

    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'TEMPLATE_API_ERROR'
      }), 
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});