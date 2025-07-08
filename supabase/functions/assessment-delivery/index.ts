import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeliveryRequest {
  session_token: string;
  question_index?: number;
  response_data?: any;
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

    const { session_token, question_index, response_data }: DeliveryRequest = await req.json();
    const startTime = Date.now();

    // Validate session token and get session details
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
        is_active,
        started_at,
        current_question_index,
        progress_data,
        expires_at,
        client_metadata
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      throw new Error('Session has expired');
    }

    // Get template and questions
    const { data: template, error: templateError } = await supabaseClient
      .from('api_assessment_templates')
      .select(`
        id,
        name,
        config,
        question_sets,
        branding,
        scoring_logic,
        estimated_duration_minutes,
        session_timeout_minutes
      `)
      .eq('id', session.template_id)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      throw new Error('Assessment template not found or inactive');
    }

    // Parse question sets and flatten questions
    const questionSets = template.question_sets || [];
    let allQuestions: any[] = [];
    
    questionSets.forEach((set: any) => {
      if (set.questions && Array.isArray(set.questions)) {
        allQuestions = allQuestions.concat(set.questions.map((q: any, idx: number) => ({
          ...q,
          set_id: set.id || set.name,
          global_index: allQuestions.length + idx,
          order_index: idx
        })));
      }
    });

    // Determine current question index
    const currentIndex = question_index !== undefined ? question_index : session.current_question_index || 0;
    
    // Check if assessment is completed
    if (currentIndex >= allQuestions.length) {
      return new Response(JSON.stringify({
        status: 'completed',
        message: 'Assessment completed',
        total_questions: allQuestions.length,
        session_id: session.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const currentQuestion = allQuestions[currentIndex];
    if (!currentQuestion) {
      throw new Error('Question not found at specified index');
    }

    // Apply conditional logic if present
    let shouldSkipQuestion = false;
    if (currentQuestion.conditional_logic && session.progress_data) {
      // Simple conditional logic evaluation
      const conditions = currentQuestion.conditional_logic;
      const progressData = session.progress_data || {};
      
      if (conditions.skip_if) {
        const { question_id, answer_value } = conditions.skip_if;
        if (progressData[question_id] === answer_value) {
          shouldSkipQuestion = true;
        }
      }
    }

    // If should skip, move to next question
    if (shouldSkipQuestion && currentIndex < allQuestions.length - 1) {
      return new Response(JSON.stringify({
        status: 'redirect',
        next_question_index: currentIndex + 1,
        message: 'Question skipped due to conditional logic'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate progress
    const progress = {
      current_question: currentIndex + 1,
      total_questions: allQuestions.length,
      percentage: Math.round(((currentIndex + 1) / allQuestions.length) * 100),
      estimated_time_remaining: Math.max(0, 
        (template.estimated_duration_minutes || 15) * (1 - (currentIndex / allQuestions.length))
      )
    };

    // Update session progress if this is not just a fetch
    if (req.method === 'POST') {
      await supabaseClient
        .from('api_assessment_sessions')
        .update({
          current_question_index: currentIndex,
          last_activity_at: new Date().toISOString(),
          started_at: session.started_at || new Date().toISOString()
        })
        .eq('id', session.id);
    }

    // Prepare question response (remove sensitive data)
    const questionResponse = {
      id: currentQuestion.id || `q_${currentIndex}`,
      title: currentQuestion.title,
      description: currentQuestion.description,
      type: currentQuestion.type,
      options: currentQuestion.options,
      validation: currentQuestion.validation,
      required: currentQuestion.required !== false,
      order_index: currentIndex,
      metadata: currentQuestion.metadata || {}
    };

    // Log API usage
    await supabaseClient.rpc('log_api_usage', {
      p_organization_id: session.organization_id,
      p_endpoint: '/assessment-delivery',
      p_method: req.method,
      p_status_code: 200,
      p_session_id: session.id,
      p_response_time_ms: Date.now() - startTime,
      p_metadata: { question_index: currentIndex, action: 'question_delivered' }
    });

    console.log('Delivered question', currentIndex, 'for session:', session.id);

    return new Response(JSON.stringify({
      status: 'active',
      session: {
        id: session.id,
        token: session_token,
        expires_at: session.expires_at
      },
      template: {
        name: template.name,
        branding: template.branding || {},
        estimated_duration_minutes: template.estimated_duration_minutes
      },
      question: questionResponse,
      progress: progress,
      navigation: {
        can_go_back: currentIndex > 0,
        can_skip: currentQuestion.required === false,
        is_last_question: currentIndex === allQuestions.length - 1
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in assessment-delivery function:', error);
    
    const statusCode = error.message.includes('Invalid') || error.message.includes('expired') ? 401 : 
                       error.message.includes('not found') ? 404 : 400;

    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'DELIVERY_ERROR'
      }), 
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});