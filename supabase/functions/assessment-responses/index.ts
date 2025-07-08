import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResponseSubmission {
  session_token: string;
  question_id: string;
  question_index: number;
  answer: any;
  time_spent?: number;
  metadata?: any;
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

    const { 
      session_token, 
      question_id, 
      question_index, 
      answer, 
      time_spent, 
      metadata 
    }: ResponseSubmission = await req.json();
    
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
        expires_at
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

    // Get template for validation
    const { data: template, error: templateError } = await supabaseClient
      .from('api_assessment_templates')
      .select('question_sets, config')
      .eq('id', session.template_id)
      .single();

    if (templateError || !template) {
      throw new Error('Template not found');
    }

    // Validate question exists and get question details
    const questionSets = template.question_sets || [];
    let targetQuestion: any = null;
    let questionSetId: string = '';

    for (const set of questionSets) {
      if (set.questions) {
        const found = set.questions.find((q: any, idx: number) => 
          (q.id === question_id) || (idx === question_index)
        );
        if (found) {
          targetQuestion = found;
          questionSetId = set.id || set.name;
          break;
        }
      }
    }

    if (!targetQuestion) {
      throw new Error('Question not found in template');
    }

    // Validate answer format based on question type
    let validatedAnswer = answer;
    const questionType = targetQuestion.type;
    
    switch (questionType) {
      case 'multiple_choice':
        if (!targetQuestion.options || !targetQuestion.options.some((opt: any) => opt.value === answer)) {
          throw new Error('Invalid answer for multiple choice question');
        }
        break;
      
      case 'rating_scale':
        const min = targetQuestion.validation?.min || 1;
        const max = targetQuestion.validation?.max || 5;
        if (typeof answer !== 'number' || answer < min || answer > max) {
          throw new Error(`Rating must be a number between ${min} and ${max}`);
        }
        break;
      
      case 'text_input':
        if (typeof answer !== 'string') {
          throw new Error('Text input answer must be a string');
        }
        if (targetQuestion.validation?.max_length && answer.length > targetQuestion.validation.max_length) {
          throw new Error(`Answer exceeds maximum length of ${targetQuestion.validation.max_length} characters`);
        }
        break;
      
      case 'yes_no':
        if (typeof answer !== 'boolean') {
          throw new Error('Yes/No answer must be a boolean');
        }
        break;
    }

    // Check if question is required and answer is provided
    if (targetQuestion.required !== false && (answer === null || answer === undefined || answer === '')) {
      throw new Error('Answer is required for this question');
    }

    // Create response record
    const responseData = {
      session_id: session.id,
      question_id: question_id,
      question_index: question_index,
      question_set_id: questionSetId,
      answer: validatedAnswer,
      question_type: questionType,
      time_spent_seconds: time_spent || 0,
      submitted_at: new Date().toISOString(),
      metadata: {
        ...metadata,
        client_timestamp: new Date().toISOString(),
        question_title: targetQuestion.title
      }
    };

    // Store response in assessment_responses table
    const { data: responseRecord, error: responseError } = await supabaseClient
      .from('assessment_responses')
      .upsert({
        assessment_id: session.id, // Using session ID as assessment ID for API sessions
        question_id: question_id,
        answer: {
          value: validatedAnswer,
          type: questionType,
          metadata: responseData.metadata
        }
      }, {
        onConflict: 'assessment_id,question_id'
      })
      .select()
      .single();

    if (responseError) {
      console.error('Error storing response:', responseError);
      throw new Error('Failed to store response');
    }

    // Update session progress
    const currentProgress = session.progress_data || {};
    const updatedProgress = {
      ...currentProgress,
      [question_id]: validatedAnswer,
      [`${question_id}_metadata`]: {
        answered_at: new Date().toISOString(),
        time_spent: time_spent,
        question_index: question_index
      }
    };

    // Calculate next question index
    const nextQuestionIndex = Math.max(question_index + 1, (session.current_question_index || 0) + 1);
    
    // Update session
    const { error: updateError } = await supabaseClient
      .from('api_assessment_sessions')
      .update({
        current_question_index: nextQuestionIndex,
        progress_data: updatedProgress,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('Error updating session:', updateError);
      throw new Error('Failed to update session progress');
    }

    // Log API usage
    await supabaseClient.rpc('log_api_usage', {
      p_organization_id: session.organization_id,
      p_endpoint: '/assessment-responses',
      p_method: req.method,
      p_status_code: 200,
      p_session_id: session.id,
      p_response_time_ms: Date.now() - startTime,
      p_metadata: { 
        question_id, 
        question_index, 
        question_type: questionType,
        action: 'response_submitted'
      }
    });

    console.log('Response submitted for session:', session.id, 'question:', question_id);

    // Check if this was the last question
    const totalQuestions = questionSets.reduce((total: number, set: any) => 
      total + (set.questions ? set.questions.length : 0), 0
    );

    const isComplete = nextQuestionIndex >= totalQuestions;

    return new Response(JSON.stringify({
      success: true,
      response_id: responseRecord.id,
      next_question_index: nextQuestionIndex,
      progress: {
        current: nextQuestionIndex,
        total: totalQuestions,
        percentage: Math.round((nextQuestionIndex / totalQuestions) * 100)
      },
      is_complete: isComplete,
      session_id: session.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in assessment-responses function:', error);
    
    const statusCode = error.message.includes('Invalid') || error.message.includes('expired') ? 401 : 
                       error.message.includes('not found') ? 404 : 
                       error.message.includes('required') || error.message.includes('must be') ? 422 : 400;

    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'RESPONSE_ERROR'
      }), 
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});