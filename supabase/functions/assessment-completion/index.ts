import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompletionRequest {
  session_token: string;
  force_complete?: boolean;
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

    const { session_token, force_complete }: CompletionRequest = await req.json();
    const startTime = Date.now();

    // Validate session token
    const { data: sessionId, error: validationError } = await supabaseClient.rpc('validate_session_token', {
      p_session_token: session_token
    });

    if (validationError || !sessionId) {
      throw new Error('Invalid or expired session token');
    }

    // Get session details
    const { data: session, error: sessionError } = await supabaseClient
      .from('api_assessment_sessions')
      .select(`
        id,
        organization_id,
        api_user_id,
        template_id,
        current_question_index,
        progress_data,
        completed_at,
        callback_url,
        webhook_url,
        return_url,
        client_metadata
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // Check if already completed
    if (session.completed_at && !force_complete) {
      const { data: existingResults } = await supabaseClient
        .from('career_assessments')
        .select('id, status')
        .eq('api_session_id', session.id)
        .single();

      return new Response(JSON.stringify({
        status: 'already_completed',
        completed_at: session.completed_at,
        assessment_id: existingResults?.id,
        message: 'Assessment already completed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get template and responses
    const { data: template, error: templateError } = await supabaseClient
      .from('api_assessment_templates')
      .select(`
        id,
        name,
        config,
        question_sets,
        scoring_logic,
        branding
      `)
      .eq('id', session.template_id)
      .single();

    if (templateError || !template) {
      throw new Error('Template not found');
    }

    // Get all responses for this session
    const { data: responses, error: responsesError } = await supabaseClient
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', session.id);

    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      throw new Error('Failed to fetch assessment responses');
    }

    // Validate completion - check if all required questions are answered
    const questionSets = template.question_sets || [];
    const requiredQuestions = questionSets.flatMap((set: any) => 
      (set.questions || []).filter((q: any) => q.required !== false)
    );

    const answeredQuestionIds = new Set(responses.map(r => r.question_id));
    const missingRequired = requiredQuestions.filter((q: any) => 
      !answeredQuestionIds.has(q.id || `q_${q.order_index}`)
    );

    if (missingRequired.length > 0 && !force_complete) {
      return new Response(JSON.stringify({
        status: 'incomplete',
        missing_required: missingRequired.length,
        message: `${missingRequired.length} required questions are not answered`,
        missing_questions: missingRequired.map(q => ({
          id: q.id,
          title: q.title,
          index: q.order_index
        }))
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate scores based on scoring logic
    const scoringLogic = template.scoring_logic || {};
    let calculatedScores: any = {};
    let profileType = 'general';
    let recommendations: any[] = [];

    if (scoringLogic.method === 'weighted_scoring') {
      // Implement weighted scoring
      const categoryScores: any = {};
      
      responses.forEach(response => {
        const questionConfig = scoringLogic.questions?.[response.question_id];
        if (questionConfig) {
          Object.entries(questionConfig.weights || {}).forEach(([category, weight]) => {
            if (!categoryScores[category]) categoryScores[category] = 0;
            categoryScores[category] += (response.answer.value * (weight as number));
          });
        }
      });

      calculatedScores = categoryScores;

      // Determine profile type based on highest score
      if (Object.keys(categoryScores).length > 0) {
        profileType = Object.entries(categoryScores).reduce((a, b) => 
          categoryScores[a[0]] > categoryScores[b[0]] ? a : b
        )[0];
      }
    } else if (scoringLogic.method === 'rule_based') {
      // Implement rule-based scoring
      const rules = scoringLogic.rules || [];
      for (const rule of rules) {
        const conditionMet = responses.some(response => 
          rule.conditions.some((condition: any) => 
            response.question_id === condition.question_id && 
            response.answer.value === condition.expected_value
          )
        );
        
        if (conditionMet) {
          profileType = rule.result_profile;
          calculatedScores[rule.result_profile] = rule.score || 100;
          break;
        }
      }
    }

    // Generate recommendations based on profile type and scores
    if (template.config?.recommendation_mapping) {
      const mapping = template.config.recommendation_mapping[profileType];
      if (mapping) {
        recommendations = mapping.careers || [];
      }
    }

    // Create or update career assessment record
    const assessmentData = {
      user_id: session.api_user_id,
      api_session_id: session.id,
      organization_id: session.organization_id,
      template_id: session.template_id,
      external_user_id: null, // Will be populated from api_users table
      status: 'completed' as const,
      detected_profile_type: profileType as any,
      completed_at: new Date().toISOString(),
      profile_detection_completed: true,
      client_metadata: session.client_metadata || {},
      callback_url: session.callback_url,
      webhook_url: session.webhook_url
    };

    const { data: assessment, error: assessmentError } = await supabaseClient
      .from('career_assessments')
      .upsert(assessmentData, {
        onConflict: 'api_session_id'
      })
      .select()
      .single();

    if (assessmentError) {
      console.error('Error creating assessment:', assessmentError);
      throw new Error('Failed to create assessment record');
    }

    // Store recommendations if any
    if (recommendations.length > 0) {
      const recommendationRecords = recommendations.map((rec, index) => ({
        assessment_id: assessment.id,
        title: rec.title || `Career ${index + 1}`,
        description: rec.description || '',
        match_score: rec.match_score || Math.round((100 - index * 10)),
        reasoning: rec.reasoning || `Recommended based on ${profileType} profile`,
        salary_range: rec.salary_range,
        work_environment: rec.work_environment,
        education_requirements: rec.education_requirements || [],
        required_skills: rec.required_skills || [],
        time_to_entry: rec.time_to_entry,
        growth_outlook: rec.growth_outlook
      }));

      const { error: recError } = await supabaseClient
        .from('career_recommendations')
        .insert(recommendationRecords);

      if (recError) {
        console.error('Error storing recommendations:', recError);
      }
    }

    // Update session as completed
    const { error: sessionUpdateError } = await supabaseClient
      .from('api_assessment_sessions')
      .update({
        completed_at: new Date().toISOString(),
        is_active: false
      })
      .eq('id', session.id);

    if (sessionUpdateError) {
      console.error('Error updating session:', sessionUpdateError);
    }

    // Prepare webhook payload if webhook URL is provided
    let webhookDelivered = false;
    if (session.webhook_url) {
      try {
        const webhookPayload = {
          event: 'assessment.completed',
          assessment_id: assessment.id,
          session_id: session.id,
          organization_id: session.organization_id,
          user_id: session.api_user_id,
          completed_at: assessment.completed_at,
          profile_type: profileType,
          scores: calculatedScores,
          recommendations: recommendations.slice(0, 5), // Limit to top 5
          metadata: session.client_metadata
        };

        const webhookResponse = await fetch(session.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Assessment-API/1.0'
          },
          body: JSON.stringify(webhookPayload)
        });

        webhookDelivered = webhookResponse.ok;
        if (!webhookResponse.ok) {
          console.error('Webhook delivery failed:', webhookResponse.status, webhookResponse.statusText);
        }
      } catch (webhookError) {
        console.error('Webhook delivery error:', webhookError);
      }
    }

    // Log API usage
    await supabaseClient.rpc('log_api_usage', {
      p_organization_id: session.organization_id,
      p_endpoint: '/assessment-completion',
      p_method: req.method,
      p_status_code: 200,
      p_session_id: session.id,
      p_response_time_ms: Date.now() - startTime,
      p_metadata: { 
        assessment_id: assessment.id,
        profile_type: profileType,
        webhook_delivered: webhookDelivered,
        action: 'assessment_completed'
      }
    });

    console.log('Assessment completed for session:', session.id, 'profile:', profileType);

    // Prepare response
    const response = {
      status: 'completed',
      assessment_id: assessment.id,
      session_id: session.id,
      completed_at: assessment.completed_at,
      results: {
        profile_type: profileType,
        scores: calculatedScores,
        recommendations: recommendations.slice(0, 10), // Return top 10
        response_count: responses.length,
        completion_rate: Math.round((responses.length / requiredQuestions.length) * 100)
      },
      webhook_delivered: webhookDelivered,
      return_url: session.return_url,
      callback_url: session.callback_url
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in assessment-completion function:', error);
    
    const statusCode = error.message.includes('Invalid') || error.message.includes('expired') ? 401 : 
                       error.message.includes('not found') ? 404 : 400;

    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'COMPLETION_ERROR'
      }), 
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});