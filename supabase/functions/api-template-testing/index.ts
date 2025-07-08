import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PreviewRequest {
  template_id: string;
  preview_mode?: 'full' | 'questions_only' | 'config_only';
}

interface TestSessionRequest {
  template_id: string;
  test_data?: object;
  simulate_responses?: boolean;
}

interface CloneTemplateRequest {
  source_template_id: string;
  new_name: string;
  new_description?: string;
  copy_questions?: boolean;
  copy_branding?: boolean;
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
      throw new Error('Invalid API key');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'preview';

    switch (req.method) {
      case 'POST':
        if (action === 'preview') {
          const previewData: PreviewRequest = await req.json();
          
          // Get template details
          const { data: template, error: templateError } = await supabaseClient
            .from('api_assessment_templates')
            .select('*')
            .eq('id', previewData.template_id)
            .eq('organization_id', orgId)
            .single();

          if (templateError || !template) {
            throw new Error('Template not found');
          }

          // Generate preview based on mode
          let previewContent = {};
          switch (previewData.preview_mode || 'full') {
            case 'full':
              previewContent = {
                template_info: {
                  id: template.id,
                  name: template.name,
                  description: template.description,
                  version: template.version,
                  estimated_duration: template.estimated_duration_minutes,
                  target_audience: template.target_audience,
                  languages: template.languages
                },
                configuration: template.config,
                question_sets: template.question_sets,
                branding: template.branding,
                scoring_logic: template.scoring_logic,
                preview_url: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/assessment/preview/${template.id}`
              };
              break;
            case 'questions_only':
              previewContent = {
                question_sets: template.question_sets,
                total_questions: Array.isArray(template.question_sets) ? 
                  template.question_sets.reduce((sum: number, set: any) => sum + (set.questions?.length || 0), 0) : 0
              };
              break;
            case 'config_only':
              previewContent = {
                configuration: template.config,
                branding: template.branding,
                scoring_logic: template.scoring_logic,
                settings: {
                  estimated_duration_minutes: template.estimated_duration_minutes,
                  max_retries: template.max_retries,
                  session_timeout_minutes: template.session_timeout_minutes
                }
              };
              break;
          }

          // Log successful preview
          await supabaseClient.rpc('log_api_usage', {
            p_organization_id: orgId,
            p_endpoint: '/api/template-testing?action=preview',
            p_method: 'POST',
            p_status_code: 200,
            p_response_time_ms: Date.now() - startTime,
            p_ip_address: ipAddress,
            p_user_agent: userAgent
          });

          return new Response(JSON.stringify({
            success: true,
            preview_mode: previewData.preview_mode || 'full',
            template_id: previewData.template_id,
            content: previewContent
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } else if (action === 'test-session') {
          const testData: TestSessionRequest = await req.json();
          
          // Create a test session
          const { data: testSessionId, error: sessionError } = await supabaseClient.rpc('create_assessment_session', {
            p_organization_id: orgId,
            p_external_user_id: 'test_user_' + Date.now(),
            p_template_id: testData.template_id,
            p_callback_url: null,
            p_webhook_url: null,
            p_return_url: null,
            p_client_metadata: { 
              test_mode: true, 
              test_data: testData.test_data || {},
              simulate_responses: testData.simulate_responses || false
            },
            p_expires_in_minutes: 30 // Short expiry for test sessions
          });

          if (sessionError || !testSessionId) {
            throw new Error('Failed to create test session');
          }

          // Get session details
          const { data: session } = await supabaseClient
            .from('api_assessment_sessions')
            .select('id, session_token, expires_at')
            .eq('id', testSessionId)
            .single();

          // Log successful test session creation
          await supabaseClient.rpc('log_api_usage', {
            p_organization_id: orgId,
            p_endpoint: '/api/template-testing?action=test-session',
            p_method: 'POST',
            p_status_code: 201,
            p_session_id: testSessionId,
            p_response_time_ms: Date.now() - startTime,
            p_ip_address: ipAddress,
            p_user_agent: userAgent
          });

          return new Response(JSON.stringify({
            success: true,
            test_session: {
              session_id: testSessionId,
              session_token: session?.session_token,
              test_url: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/assessment/${session?.session_token}`,
              expires_at: session?.expires_at,
              test_mode: true
            }
          }), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } else if (action === 'clone') {
          const cloneData: CloneTemplateRequest = await req.json();
          
          // Get source template
          const { data: sourceTemplate, error: sourceError } = await supabaseClient
            .from('api_assessment_templates')
            .select('*')
            .eq('id', cloneData.source_template_id)
            .eq('organization_id', orgId)
            .single();

          if (sourceError || !sourceTemplate) {
            throw new Error('Source template not found');
          }

          // Create cloned template
          const clonedTemplate = {
            organization_id: orgId,
            name: cloneData.new_name,
            description: cloneData.new_description || `Copy of ${sourceTemplate.name}`,
            config: sourceTemplate.config,
            question_sets: cloneData.copy_questions ? sourceTemplate.question_sets : [],
            branding: cloneData.copy_branding ? sourceTemplate.branding : {},
            scoring_logic: sourceTemplate.scoring_logic,
            target_audience: sourceTemplate.target_audience,
            languages: sourceTemplate.languages,
            estimated_duration_minutes: sourceTemplate.estimated_duration_minutes,
            max_retries: sourceTemplate.max_retries,
            session_timeout_minutes: sourceTemplate.session_timeout_minutes,
            is_default: false,
            version: 1
          };

          const { data: newTemplate, error: cloneError } = await supabaseClient
            .from('api_assessment_templates')
            .insert(clonedTemplate)
            .select()
            .single();

          if (cloneError) throw cloneError;

          // Log successful template clone
          await supabaseClient.rpc('log_api_usage', {
            p_organization_id: orgId,
            p_endpoint: '/api/template-testing?action=clone',
            p_method: 'POST',
            p_status_code: 201,
            p_response_time_ms: Date.now() - startTime,
            p_ip_address: ipAddress,
            p_user_agent: userAgent
          });

          return new Response(JSON.stringify({
            success: true,
            cloned_template: newTemplate,
            source_template_id: cloneData.source_template_id
          }), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } else if (action === 'validate') {
          const { template_id } = await req.json();
          
          // Get template for validation
          const { data: template, error: templateError } = await supabaseClient
            .from('api_assessment_templates')
            .select('*')
            .eq('id', template_id)
            .eq('organization_id', orgId)
            .single();

          if (templateError || !template) {
            throw new Error('Template not found');
          }

          // Perform validation checks
          const validationResults = {
            is_valid: true,
            errors: [] as string[],
            warnings: [] as string[],
            suggestions: [] as string[]
          };

          // Check required fields
          if (!template.name || template.name.trim() === '') {
            validationResults.errors.push('Template name is required');
            validationResults.is_valid = false;
          }

          if (!template.config || Object.keys(template.config).length === 0) {
            validationResults.errors.push('Template configuration is required');
            validationResults.is_valid = false;
          }

          // Check question sets
          if (!template.question_sets || !Array.isArray(template.question_sets) || template.question_sets.length === 0) {
            validationResults.warnings.push('No question sets defined - template will not be functional');
          } else {
            const totalQuestions = template.question_sets.reduce((sum: number, set: any) => sum + (set.questions?.length || 0), 0);
            if (totalQuestions === 0) {
              validationResults.errors.push('No questions defined in question sets');
              validationResults.is_valid = false;
            } else if (totalQuestions < 5) {
              validationResults.warnings.push('Very few questions defined - consider adding more for better assessment quality');
            }
          }

          // Check duration vs question count
          if (template.question_sets && Array.isArray(template.question_sets)) {
            const totalQuestions = template.question_sets.reduce((sum: number, set: any) => sum + (set.questions?.length || 0), 0);
            const estimatedTime = totalQuestions * 1.5; // 1.5 minutes per question estimate
            if (template.estimated_duration_minutes && template.estimated_duration_minutes < estimatedTime) {
              validationResults.warnings.push(`Estimated duration (${template.estimated_duration_minutes}min) may be too short for ${totalQuestions} questions`);
            }
          }

          // Check languages
          if (!template.languages || template.languages.length === 0) {
            validationResults.warnings.push('No languages specified - defaulting to English');
          }

          // Suggestions
          if (!template.branding || Object.keys(template.branding).length === 0) {
            validationResults.suggestions.push('Consider adding branding customization for better user experience');
          }

          if (!template.scoring_logic || Object.keys(template.scoring_logic).length === 0) {
            validationResults.suggestions.push('Consider defining custom scoring logic for more accurate results');
          }

          // Log validation
          await supabaseClient.rpc('log_api_usage', {
            p_organization_id: orgId,
            p_endpoint: '/api/template-testing?action=validate',
            p_method: 'POST',
            p_status_code: 200,
            p_response_time_ms: Date.now() - startTime,
            p_ip_address: ipAddress,
            p_user_agent: userAgent
          });

          return new Response(JSON.stringify({
            success: true,
            template_id,
            validation: validationResults
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        throw new Error('Invalid action specified');

      default:
        throw new Error(`Method ${req.method} not allowed`);
    }

  } catch (error) {
    console.error('Error in api-template-testing function:', error);
    
    const statusCode = error.message.includes('Invalid API key') ? 401 : 
                      error.message.includes('not found') ? 404 :
                      error.message.includes('required') || error.message.includes('Invalid action') ? 400 : 500;

    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'TEMPLATE_TESTING_ERROR'
      }), 
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});