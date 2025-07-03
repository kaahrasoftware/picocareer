
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { action, data } = await req.json();

    console.log('Processing analytics action:', action);

    switch (action) {
      case 'getStats':
        return await getAssessmentStats(supabase);
      case 'trackUsage':
        return await trackAssessmentUsage(supabase, data);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in assessment-analytics function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function getAssessmentStats(supabase: any) {
  // Get total assessments
  const { data: totalAssessments, error: totalError } = await supabase
    .from('career_assessments')
    .select('id', { count: 'exact' });

  // Get completed assessments
  const { data: completedAssessments, error: completedError } = await supabase
    .from('career_assessments')
    .select('id', { count: 'exact' })
    .eq('status', 'completed');

  // Get assessments by week
  const { data: weeklyStats, error: weeklyError } = await supabase
    .from('career_assessments')
    .select('created_at, status')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  // Get popular career recommendations
  const { data: topRecommendations, error: recsError } = await supabase
    .from('career_recommendations')
    .select('title, career_id')
    .order('match_score', { ascending: false })
    .limit(10);

  if (totalError || completedError || weeklyError || recsError) {
    throw new Error('Failed to retrieve statistics');
  }

  const stats = {
    totalAssessments: totalAssessments?.length || 0,
    completedAssessments: completedAssessments?.length || 0,
    completionRate: totalAssessments?.length 
      ? ((completedAssessments?.length || 0) / totalAssessments.length * 100).toFixed(1)
      : '0',
    weeklyStats: processWeeklyStats(weeklyStats || []),
    topRecommendations: processTopRecommendations(topRecommendations || [])
  };

  return new Response(
    JSON.stringify({ success: true, stats }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function trackAssessmentUsage(supabase: any, data: any) {
  const { userId, action, metadata } = data;

  // Insert usage tracking record
  const { error } = await supabase
    .from('content_engagement')
    .insert({
      profile_id: userId,
      content_type: 'career_assessment',
      content_id: metadata?.assessmentId || 'unknown',
      time_spent: metadata?.timeSpent || 0,
      scroll_depth: metadata?.progress || 0
    });

  if (error) {
    throw new Error('Failed to track usage');
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function processWeeklyStats(data: any[]) {
  const weekly = data.reduce((acc: any, item: any) => {
    const week = new Date(item.created_at).toISOString().slice(0, 10);
    if (!acc[week]) {
      acc[week] = { total: 0, completed: 0 };
    }
    acc[week].total++;
    if (item.status === 'completed') {
      acc[week].completed++;
    }
    return acc;
  }, {});

  return Object.entries(weekly).map(([date, stats]: [string, any]) => ({
    date,
    total: stats.total,
    completed: stats.completed
  }));
}

function processTopRecommendations(data: any[]) {
  const counts = data.reduce((acc: any, item: any) => {
    if (!acc[item.title]) {
      acc[item.title] = 0;
    }
    acc[item.title]++;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([title, count]) => ({ title, count }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);
}
