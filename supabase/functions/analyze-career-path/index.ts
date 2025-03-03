
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get API key from environment variable
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
    
    if (!DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'DeepSeek API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Parse request body
    const { sessionId } = await req.json()
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Get all messages for this session
    const { data: messages, error: messagesError } = await supabase
      .from('career_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    
    if (messagesError) {
      throw new Error(`Error fetching messages: ${messagesError.message}`)
    }
    
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No messages found for this session' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    // Prepare conversation history for analysis
    const conversationText = messages
      .map(msg => {
        if (msg.message_type === 'user') {
          return `User: ${msg.content}`
        } else if (msg.message_type === 'bot') {
          return `Career Advisor: ${msg.content}`
        }
        return null
      })
      .filter(Boolean)
      .join('\n\n')
    
    // Get available careers from the database to use for recommendations
    const { data: careers, error: careersError } = await supabase
      .from('careers')
      .select('id, title, description, salary_range, required_skills, required_education, work_environment, growth_potential')
      .eq('status', 'Approved')
      .order('profiles_count', { ascending: false })
      .limit(50)
    
    if (careersError) {
      throw new Error(`Error fetching careers: ${careersError.message}`)
    }
    
    // Format careers as a list for the AI
    const careersText = careers.map(career => 
      `ID: ${career.id}\nTitle: ${career.title}\nDescription: ${career.description}\n` +
      `Salary Range: ${career.salary_range || 'Not specified'}\n` +
      `Required Skills: ${Array.isArray(career.required_skills) ? career.required_skills.join(', ') : 'Not specified'}\n` +
      `Required Education: ${Array.isArray(career.required_education) ? career.required_education.join(', ') : 'Not specified'}\n` +
      `Work Environment: ${career.work_environment || 'Not specified'}\n` +
      `Growth Potential: ${career.growth_potential || 'Not specified'}`
    ).join('\n\n');
    
    // Get personality types from the database
    const { data: personalityTypes, error: personalityError } = await supabase
      .from('personality_types')
      .select('id, type, title, traits, strengths, weaknesses')
    
    if (personalityError) {
      throw new Error(`Error fetching personality types: ${personalityError.message}`)
    }
    
    // Format personality types as a list for the AI
    const personalityText = personalityTypes.map(pt => 
      `Type: ${pt.type}\nTitle: ${pt.title}\nTraits: ${Array.isArray(pt.traits) ? pt.traits.join(', ') : ''}\n` +
      `Strengths: ${Array.isArray(pt.strengths) ? pt.strengths.join(', ') : ''}\n` +
      `Weaknesses: ${Array.isArray(pt.weaknesses) ? pt.weaknesses.join(', ') : ''}`
    ).join('\n\n');
    
    // Get mentors from the database
    const { data: mentors, error: mentorsError } = await supabase
      .from('profiles')
      .select(`
        id, 
        full_name, 
        position, 
        bio, 
        skills, 
        tools_used, 
        years_of_experience,
        total_booked_sessions,
        location
      `)
      .eq('user_type', 'mentor')
      .eq('top_mentor', true)
      .order('total_booked_sessions', { ascending: false })
      .limit(20)
    
    if (mentorsError) {
      throw new Error(`Error fetching mentors: ${mentorsError.message}`)
    }
    
    // Format mentors as a list for the AI
    const mentorsText = mentors.map(mentor => 
      `ID: ${mentor.id}\nName: ${mentor.full_name || 'Unnamed'}\nPosition: ${mentor.position || 'Not specified'}\n` +
      `Bio: ${mentor.bio || 'Not specified'}\n` +
      `Skills: ${Array.isArray(mentor.skills) ? mentor.skills.join(', ') : 'Not specified'}\n` +
      `Tools: ${Array.isArray(mentor.tools_used) ? mentor.tools_used.join(', ') : 'Not specified'}\n` +
      `Experience: ${mentor.years_of_experience || 0} years\n` +
      `Sessions: ${mentor.total_booked_sessions || 0}\n` +
      `Location: ${mentor.location || 'Not specified'}`
    ).join('\n\n');
    
    // Create prompt for the AI
    const prompt = `
You are an AI career advisor analyzing a conversation between a Career Advisor and a User about career preferences.

Conversation:
${conversationText}

Based on this conversation, I want you to:

1. Identify the user's skills, interests, preferences, educational background, and career goals.

2. Recommend 5-7 career matches from the following list. For each career, provide:
   - Title (exactly as it appears in the list)
   - Match score (0-100%)
   - Brief explanation of why this career matches the user's profile

Available Careers:
${careersText}

3. Recommend 3 personality types that best match the user from the following list:
   - Include the type and title (exactly as they appear)
   - Match score (0-100%)
   - Brief explanation of why this personality type matches the user

Available Personality Types:
${personalityText}

4. Recommend 5 mentors who would be helpful for the user's career path:
   - Include the mentor's name and position
   - Brief explanation of why they would be a good mentor for the user

Available Mentors:
${mentorsText}

Format your answer in clear sections for Career Recommendations, Personality Assessment, and Mentor Suggestions.
`;
    
    // Send request to DeepSeek API for analysis
    console.log('Sending analysis request to DeepSeek API');
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1500
      })
    });
    
    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.text();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${deepseekResponse.status} ${errorData}`);
    }
    
    const deepseekData = await deepseekResponse.json();
    const analysisContent = deepseekData.choices[0].message.content;
    console.log('Analysis response:', analysisContent);
    
    // Parse the analysis to extract career recommendations
    const careerRecommendations = extractCareerRecommendations(analysisContent, careers);
    const personalityRecommendations = extractPersonalityRecommendations(analysisContent, personalityTypes);
    const mentorRecommendations = extractMentorRecommendations(analysisContent, mentors);
    
    // Store the analysis in the database
    const { data: analysisMessage, error: analysisError } = await supabase
      .from('career_chat_messages')
      .insert({
        session_id: sessionId,
        message_type: 'recommendation',
        content: analysisContent,
        metadata: {
          isRecommendation: true,
          analysisComplete: true,
          careersCount: careerRecommendations.length,
          personalitiesCount: personalityRecommendations.length,
          mentorsCount: mentorRecommendations.length
        }
      })
      .select()
      .single();
    
    if (analysisError) {
      console.error('Error storing analysis:', analysisError);
      throw new Error('Failed to store analysis');
    }
    
    // Store each career recommendation
    for (const career of careerRecommendations) {
      await supabase
        .from('career_chat_recommendations')
        .insert({
          session_id: sessionId,
          career_id: career.id,
          score: career.score,
          reasoning: career.reasoning,
          metadata: {
            title: career.title,
            salary_range: career.salary_range,
            skills: career.skills,
            education: career.education,
            environment: career.environment
          }
        });
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        messageId: analysisMessage.id,
        careers: careerRecommendations,
        personalities: personalityRecommendations,
        mentors: mentorRecommendations
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in analyze-career-path function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to extract career recommendations from the analysis text
function extractCareerRecommendations(text: string, careers: any[]) {
  const recommendations: Array<{
    id: string;
    title: string;
    score: number;
    reasoning: string;
    salary_range?: string;
    skills?: string[];
    education?: string[];
    environment?: string;
  }> = [];
  
  // Extract the Career Recommendations section
  const careerSection = text.split(/Career Recommendations|Career Matches/i)[1]?.split(/Personality Assessment|Personality Type/i)[0] || '';
  
  if (careerSection) {
    // Look for patterns like "1. Software Developer (85%)" or "Software Developer - 85%"
    const matches = careerSection.match(/[^-\n]*?(\d+%)/g) || [];
    
    for (const match of matches) {
      // Extract title and score
      const scoreMatch = match.match(/(\d+)%/);
      if (!scoreMatch) continue;
      
      const score = parseInt(scoreMatch[1], 10);
      const title = match.replace(scoreMatch[0], '').trim().replace(/^\d+\.\s+/, '');
      
      // Find the career in our database
      const career = careers.find(c => 
        c.title.toLowerCase() === title.toLowerCase() ||
        title.toLowerCase().includes(c.title.toLowerCase())
      );
      
      if (career) {
        // Extract explanation - look for text after the score until the next match
        const matchPos = careerSection.indexOf(match);
        const nextMatchPos = careerSection.indexOf('%', matchPos + match.length);
        
        let reasoning = '';
        if (nextMatchPos > 0) {
          reasoning = careerSection.substring(matchPos + match.length, nextMatchPos).trim();
        } else {
          reasoning = careerSection.substring(matchPos + match.length).split('\n\n')[0].trim();
        }
        
        recommendations.push({
          id: career.id,
          title: career.title,
          score: score,
          reasoning: reasoning || `This career matches your profile based on the conversation.`,
          salary_range: career.salary_range,
          skills: career.required_skills,
          education: career.required_education,
          environment: career.work_environment
        });
      }
    }
  }
  
  return recommendations;
}

// Helper function to extract personality recommendations
function extractPersonalityRecommendations(text: string, personalityTypes: any[]) {
  const recommendations: Array<{
    type: string;
    title: string;
    score: number;
    description: string;
    traits?: string[];
    strengths?: string[];
  }> = [];
  
  // Extract the Personality Assessment section
  const personalitySection = text.split(/Personality Assessment|Personality Type/i)[1]?.split(/Mentor Suggestions|Recommended Mentors/i)[0] || '';
  
  if (personalitySection) {
    // Look for patterns like "1. ENFJ - The Protagonist (85%)" or "ENFJ (85%)"
    const matches = personalitySection.match(/[^-\n]*?(\d+%)/g) || [];
    
    for (const match of matches) {
      // Extract type and score
      const scoreMatch = match.match(/(\d+)%/);
      if (!scoreMatch) continue;
      
      const score = parseInt(scoreMatch[1], 10);
      const typeText = match.replace(scoreMatch[0], '').trim().replace(/^\d+\.\s+/, '');
      
      // Try to extract personality type code (e.g., ENFJ)
      const typeCodeMatch = typeText.match(/[EI][NS][TF][JP]/);
      const typeCode = typeCodeMatch ? typeCodeMatch[0] : '';
      
      // Find the personality type in our database
      const personalityType = personalityTypes.find(pt => 
        (typeCode && pt.type === typeCode) ||
        pt.title.toLowerCase().includes(typeText.toLowerCase()) ||
        typeText.toLowerCase().includes(pt.title.toLowerCase())
      );
      
      if (personalityType) {
        // Extract explanation
        const matchPos = personalitySection.indexOf(match);
        const nextMatchPos = personalitySection.indexOf('%', matchPos + match.length);
        
        let description = '';
        if (nextMatchPos > 0) {
          description = personalitySection.substring(matchPos + match.length, nextMatchPos).trim();
        } else {
          description = personalitySection.substring(matchPos + match.length).split('\n\n')[0].trim();
        }
        
        recommendations.push({
          type: personalityType.type,
          title: personalityType.title,
          score: score,
          description: description || `This personality type matches your profile.`,
          traits: personalityType.traits,
          strengths: personalityType.strengths
        });
      }
    }
  }
  
  return recommendations;
}

// Helper function to extract mentor recommendations
function extractMentorRecommendations(text: string, mentors: any[]) {
  const recommendations: Array<{
    id: string;
    name: string;
    skills: string[];
    position?: string;
    experience?: number;
    sessions?: number;
    location?: string;
    reasoning: string;
  }> = [];
  
  // Extract the Mentor Suggestions section
  const mentorSection = text.split(/Mentor Suggestions|Recommended Mentors/i)[1] || '';
  
  if (mentorSection) {
    // Look for patterns like "1. John Smith" or "John Smith -"
    const mentorLines = mentorSection.split('\n').filter(line => 
      /^\d+\.\s+/.test(line.trim()) || 
      /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(line.trim())
    );
    
    for (const line of mentorLines) {
      // Extract name
      const nameMatch = line.match(/\d+\.\s+(.*?)(?:\s*\(|\s*-|\s*:|\s*$)/) || 
                       line.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/) ||
                       line.match(/^([A-Z][a-z]+)/);
                       
      if (!nameMatch) continue;
      const mentorName = nameMatch[1].trim();
      
      // Find the mentor in our database
      const mentor = mentors.find(m => {
        if (!m.full_name) return false;
        return m.full_name.toLowerCase().includes(mentorName.toLowerCase()) || 
               mentorName.toLowerCase().includes(m.full_name.toLowerCase());
      });
      
      if (mentor) {
        // Extract explanation
        const linePos = mentorSection.indexOf(line);
        const nextLinePos = mentorSection.indexOf('\n', linePos + line.length);
        
        let reasoning = '';
        if (nextLinePos > 0) {
          const nextNumberedLinePos = mentorSection.substring(nextLinePos).search(/^\d+\.\s+/m);
          if (nextNumberedLinePos > 0) {
            reasoning = mentorSection.substring(linePos + line.length, nextLinePos + nextNumberedLinePos).trim();
          } else {
            reasoning = mentorSection.substring(linePos + line.length).trim();
          }
        }
        
        recommendations.push({
          id: mentor.id,
          name: mentor.full_name,
          skills: mentor.skills || [],
          position: mentor.position,
          experience: mentor.years_of_experience,
          sessions: mentor.total_booked_sessions,
          location: mentor.location,
          reasoning: reasoning || `This mentor has expertise relevant to your career interests.`
        });
      }
    }
  }
  
  return recommendations;
}
