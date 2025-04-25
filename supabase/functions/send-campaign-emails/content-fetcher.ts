
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { ContentItem } from "./types";

export async function fetchContentDetails(supabase: any, contentType: string, contentIds: string[]): Promise<ContentItem[]> {
  if (!contentIds || contentIds.length === 0) {
    return [];
  }

  console.log(`Fetching ${contentType} details for IDs:`, contentIds);

  try {
    let data: ContentItem[] = [];
    
    switch (contentType) {
      case 'scholarships':
        const { data: scholarships, error: scholarshipError } = await supabase
          .from('scholarships')
          .select('id, title, description, deadline, provider_name, amount, image_url')
          .in('id', contentIds);
        
        if (scholarshipError) throw new Error(`Error fetching scholarships: ${scholarshipError.message}`);
        data = scholarships?.map(s => ({
          ...s,
          cover_image_url: s.image_url
        })) || [];
        break;
        
      case 'opportunities':
        const { data: opportunities, error: opportunityError } = await supabase
          .from('opportunities')
          .select('id, title, description, provider_name, compensation, location, remote, deadline, cover_image_url')
          .in('id', contentIds);
        
        if (opportunityError) throw new Error(`Error fetching opportunities: ${opportunityError.message}`);
        data = opportunities || [];
        break;
        
      case 'careers':
        const { data: careers, error: careerError } = await supabase
          .from('careers')
          .select('id, title, description, salary_range, cover_image_url, keywords')
          .in('id', contentIds);
        
        if (careerError) throw new Error(`Error fetching careers: ${careerError.message}`);
        data = careers || [];
        break;
        
      case 'majors':
        const { data: majors, error: majorError } = await supabase
          .from('majors')
          .select('id, title, description, potential_salary, job_prospects')
          .in('id', contentIds);
        
        if (majorError) throw new Error(`Error fetching majors: ${majorError.message}`);
        data = majors || [];
        break;
        
      case 'mentors':
        const { data: mentorData, error: mentorError } = await supabase
          .from('profiles')
          .select(`
            id, 
            full_name,
            bio,
            avatar_url,
            skills,
            position,
            companies:company_id (
              name
            ),
            careers:position (
              title
            )
          `)
          .in('id', contentIds)
          .eq('user_type', 'mentor');

        if (mentorError) throw new Error(`Error fetching mentors: ${mentorError.message}`);
        
        data = (mentorData || []).map(mentor => ({
          id: mentor.id,
          title: mentor.full_name || '',
          description: mentor.bio || '',
          avatar_url: mentor.avatar_url,
          skills: mentor.skills,
          position: mentor.position || '',
          career_title: mentor.careers?.title || '',
          company_name: mentor.companies?.name || ''
        }));
        break;
        
      case 'blogs':
        const { data: blogs, error: blogError } = await supabase
          .from('blogs')
          .select('id, title, summary, cover_image_url, categories, author_id')
          .in('id', contentIds);
        
        if (blogError) throw new Error(`Error fetching blogs: ${blogError.message}`);
        data = blogs || [];
        break;
        
      case 'schools':
        const { data: schools, error: schoolError } = await supabase
          .from('schools')
          .select('id, name, type, location, country, state, website')
          .in('id', contentIds);
        
        if (schoolError) throw new Error(`Error fetching schools: ${schoolError.message}`);
        
        data = (schools || []).map(school => ({
          ...school,
          title: school.name || 'Unnamed School',
          location: school.location || [school.state, school.country].filter(Boolean).join(', ') || 'Location not specified'
        }));
        break;
        
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
    
    console.log(`Successfully fetched ${data.length} ${contentType} items:`, data);
    return data;
    
  } catch (error) {
    console.error(`Error fetching ${contentType} details:`, error);
    throw error;
  }
}
