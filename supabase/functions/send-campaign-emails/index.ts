import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";
import { getEmailSubject, generateEmailContent, CONTENT_TYPE_LABELS } from "../../utils/email-templates/index.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CampaignEmailRequest {
  campaignId: string;
  batchSize?: number;
  retryCount?: number;
}

async function fetchContentDetails(supabase: any, contentType: string, contentIds: string[]) {
  if (!contentIds || contentIds.length === 0) {
    return [];
  }

  console.log(`Fetching ${contentType} details for IDs:`, contentIds);

  try {
    let data: any[] = [];
    
    switch (contentType) {
      case 'scholarships':
        const { data: scholarships, error: scholarshipError } = await supabase
          .from('scholarships')
          .select('id, title, description, deadline, provider_name, amount')
          .in('id', contentIds);
        
        if (scholarshipError) throw new Error(`Error fetching scholarships: ${scholarshipError.message}`);
        data = scholarships || [];
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
    
    console.log(`Successfully fetched ${data.length} ${contentType} items`);
    return data;
    
  } catch (error) {
    console.error(`Error fetching ${contentType} details:`, error);
    throw error;
  }
}

function getImageUrl(content: any, contentType: string): string | null {
  if (!content) return null;
  
  switch (contentType) {
    case 'blogs':
    case 'opportunities':
    case 'careers':
      return content.cover_image_url;
    case 'mentors':
      return content.avatar_url;
    case 'schools':
      return content.banner_url || content.logo_url;
    default:
      return null;
  }
}

function getContentUrl(id: string, contentType: string, siteUrl: string): string {
  const baseUrl = siteUrl || 'https://picocareer.com';
  
  switch (contentType) {
    case 'blogs':
      return `${baseUrl}/blog/${id}`;
    case 'scholarships':
      return `${baseUrl}/scholarships/${id}`;
    case 'opportunities':
      return `${baseUrl}/opportunities/${id}`;
    case 'careers':
      return `${baseUrl}/career/${id}`;
    case 'majors':
      return `${baseUrl}/program/${id}`;
    case 'mentors':
      return `${baseUrl}/mentor/${id}`;
    case 'schools':
      return `${baseUrl}/school/${id}`;
    default:
      return baseUrl;
  }
}

function getContentDetails(content: any, contentType: string): string {
  if (!content) {
    return `<p style="color: #4b5563;">No details available.</p>`;
  }
  
  const truncateText = (text: string, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };
  
  switch (contentType) {
    case 'blogs':
      return `
        <p style="color: #4b5563; margin-bottom: 8px;">${truncateText(content.summary)}</p>
        ${content.categories ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Categories: ${Array.isArray(content.categories) ? content.categories.join(', ') : content.categories}</p>` : ''}
      `;
      
    case 'scholarships':
      return `
        <p style="color: #4b5563; margin-bottom: 8px;">${truncateText(content.description)}</p>
        ${content.provider_name ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Provider: ${content.provider_name}</p>` : ''}
        ${content.amount ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Amount: ${content.amount}</p>` : ''}
        ${content.deadline ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Deadline: ${formatDate(content.deadline)}</p>` : ''}
      `;
      
    case 'opportunities':
      return `
        <p style="color: #4b5563; margin-bottom: 8px;">${truncateText(content.description)}</p>
        ${content.provider_name ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Provider: ${content.provider_name}</p>` : ''}
        ${content.compensation ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Compensation: ${content.compensation}</p>` : ''}
        ${content.location ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">${content.location}${content.remote ? ' (Remote)' : ''}</p>` : ''}
        ${content.deadline ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Deadline: ${formatDate(content.deadline)}</p>` : ''}
      `;
      
    case 'careers':
      return `
        <p style="color: #4b5563; margin-bottom: 8px;">${truncateText(content.description)}</p>
        ${content.salary_range ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Salary Range: ${content.salary_range}</p>` : ''}
        ${content.keywords && content.keywords.length > 0 ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Keywords: ${Array.isArray(content.keywords) ? content.keywords.slice(0, 5).join(', ') : ''}</p>` : ''}
      `;
      
    case 'majors':
      return `
        <p style="color: #4b5563; margin-bottom: 8px;">${truncateText(content.description)}</p>
        ${content.job_prospects ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Job Prospects: ${content.job_prospects}</p>` : ''}
        ${content.potential_salary ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Potential Salary: ${content.potential_salary}</p>` : ''}
      `;
      
    case 'mentors':
      return `
        <p style="color: #4b5563; margin-bottom: 8px;">${truncateText(content.description)}</p>
        ${content.career_title ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">${content.career_title}</p>` : ''}
        ${content.company_name ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">at ${content.company_name}</p>` : ''}
        ${content.skills ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Skills: ${Array.isArray(content.skills) ? content.skills.slice(0, 3).join(', ') + (content.skills.length > 3 ? '...' : '') : content.skills}</p>` : ''}
      `;
      
    case 'schools':
      return `
        ${content.type ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Type: ${content.type}</p>` : ''}
        ${content.location ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Location: ${content.location}</p>` : ''}
        ${content.website ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Website: <a href="${content.website}" style="color: #2a2a72;">${content.website}</a></p>` : ''}
      `;
      
    default:
      return `<p style="color: #4b5563;">No details available.</p>`;
  }
}

function formatContentForEmail(content: any, contentType: string, siteUrl: string): string {
  if (!content) return '';
  
  const imgSrc = getImageUrl(content, contentType);
  const imgHtml = imgSrc 
    ? `<img src="${imgSrc}" alt="${content.title || 'Content'}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px;">`
    : ''; 
  
  const contentTitle = content.title || content.name || content.full_name || 'Untitled';
  const detailsHtml = getContentDetails(content, contentType);
  const contentUrl = getContentUrl(content.id, contentType, siteUrl);
  
  return `
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: white;">
      <div style="padding: 16px;">
        ${imgHtml}
        <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: #2a2a72;">${contentTitle}</h3>
        ${detailsHtml}
        <div style="margin-top: 16px;">
          <a href="${contentUrl}" style="display: inline-block; background-color: #2a2a72; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: 600;">Learn More</a>
        </div>
      </div>
    </div>
  `;
}

async function processBatchSending(
  recipients: { id: string; email: string; full_name?: string }[],
  emailSubject: string,
  emailContent: string,
  campaignId: string,
  batchSize: number,
  supabaseClient: any
): Promise<{ sent: number, failed: number, errors: any[] }> {
  
  let sentCount = 0;
  let failedCount = 0;
  const errors = [];
  const processedRecipientIds: string[] = [];
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(recipients.length/batchSize)} (${batch.length} recipients)`);
    
    const batchPromises = batch.map(async (recipient) => {
      try {
        if (!recipient.email || !recipient.email.includes('@')) {
          throw new Error(`Invalid email format: ${recipient.email}`);
        }
        
        const res = await resend.emails.send({
          from: "PicoCareer <info@picocareer.com>",
          to: [recipient.email],
          subject: emailSubject,
          html: emailContent,
        });
        
        if (res.error) {
          throw new Error(res.error.message || JSON.stringify(res.error));
        }
        
        processedRecipientIds.push(recipient.id);
        sentCount++;
        
        return { success: true, recipient_id: recipient.id, email: recipient.email };
        
      } catch (error) {
        failedCount++;
        const errMsg = (error as Error).message || String(error);
        errors.push({ 
          recipient_id: recipient.id, 
          email: recipient.email, 
          error: errMsg 
        });
        
        console.error(`Email send failure for ${recipient.email}: ${errMsg}`);
        return { success: false, recipient_id: recipient.id, email: recipient.email, error: errMsg };
      }
    });
    
    await Promise.all(batchPromises);
    
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return { sent: sentCount, failed: failedCount, errors };
}

async function updateCampaignStatus(
  supabase: any,
  campaignId: string,
  status: string,
  sentCount: number,
  failedCount: number,
  recipientsCount: number,
  lastError?: string
): Promise<void> {
  try {
    const updateData: any = {
      status,
      sent_at: status !== 'failed' ? new Date().toISOString() : null,
      recipients_count: recipientsCount,
      sent_count: sentCount,
      failed_count: failedCount
    };
    
    if (lastError) {
      updateData.last_error = lastError;
    }
    
    const { error } = await supabase
      .from('email_campaigns')
      .update(updateData)
      .eq('id', campaignId);
      
    if (error) {
      console.error("Failed to update campaign status:", error.message);
    }
  } catch (error) {
    console.error("Error updating campaign status:", error);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let campaignId: string, batchSize: number, retryCount: number;
    
    try {
      const json = await req.json();
      campaignId = json.campaignId;
      batchSize = json.batchSize ?? 50;
      retryCount = json.retryCount ?? 0;
    } catch (error) {
      console.error("Invalid JSON in request body:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON request body."
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!campaignId) {
      console.error("Missing campaignId in request.");
      return new Response(
        JSON.stringify({ success: false, error: "Campaign ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: campaign, error: campaignError } = await supabaseClient
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign not found:", campaignError?.message);
      return new Response(
        JSON.stringify({ success: false, error: `Campaign not found: ${campaignError?.message || "Unknown error"}` }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    await supabaseClient
      .from('email_campaigns')
      .update({ 
        status: 'processing', 
        last_checked_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    let recipients: { id: string; email: string; full_name?: string }[] = [];
    try {
      if (campaign.recipient_type === 'selected' && campaign.recipient_filter?.profile_ids) {
        const { data: selectedRecipients, error: recipientsError } = await supabaseClient
          .from('profiles')
          .select('id, email, full_name')
          .in('id', campaign.recipient_filter.profile_ids);
          
        if (recipientsError) {
          throw new Error(`Error fetching selected recipients: ${recipientsError.message}`);
        }
        recipients = selectedRecipients || [];
        
      } else {
        let query = supabaseClient
          .from('profiles')
          .select('id, email, full_name');
          
        if (campaign.recipient_type === 'mentees') {
          query = query.eq('user_type', 'mentee');
        } else if (campaign.recipient_type === 'mentors') {
          query = query.eq('user_type', 'mentor');
        }
        
        const { data: queriedRecipients, error: recipientsError } = await query;
        
        if (recipientsError) {
          throw new Error(`Error fetching recipients: ${recipientsError.message}`);
        }
        recipients = queriedRecipients || [];
      }
    } catch (error) {
      console.error("Error fetching recipients:", error);
      await updateCampaignStatus(supabaseClient, campaignId, 'failed', 0, 0, recipients.length, `Error fetching recipients: ${(error as Error).message}`);
      
      return new Response(
        JSON.stringify({ success: false, error: "Error fetching recipients: " + (error as Error).message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (recipients.length === 0) {
      console.warn("No recipients found for this campaign:", campaignId);
      await updateCampaignStatus(supabaseClient, campaignId, 'failed', 0, 0, 0, "No recipients found for this campaign");
      
      return new Response(
        JSON.stringify({ success: false, error: "No recipients found for this campaign" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let contentIds: string[] = [];
    if (campaign.content_ids && Array.isArray(campaign.content_ids) && campaign.content_ids.length > 0) {
      contentIds = campaign.content_ids;
    } else if (campaign.content_type && campaign.content_id) {
      contentIds = [campaign.content_id];
    }

    if (contentIds.length === 0) {
      console.error("No content IDs found in campaign:", campaignId);
      await updateCampaignStatus(supabaseClient, campaignId, 'failed', 0, 0, recipients.length, "No content IDs found in campaign");
      
      return new Response(
        JSON.stringify({ success: false, error: "No content IDs found in campaign" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    let contentList: any[] = [];
    try {
      contentList = await fetchContentDetails(supabaseClient, campaign.content_type, contentIds);
    } catch (error) {
      console.error("Error fetching content details:", error);
      await updateCampaignStatus(supabaseClient, campaignId, 'failed', 0, 0, recipients.length, `Error fetching content details: ${(error as Error).message}`);
      
      return new Response(
        JSON.stringify({ success: false, error: "Error fetching content details: " + (error as Error).message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (contentList.length === 0) {
      console.error("No content details found for the provided IDs:", contentIds);
      await updateCampaignStatus(supabaseClient, campaignId, 'failed', 0, 0, recipients.length, "No content details found for the provided IDs");
      
      return new Response(
        JSON.stringify({ success: false, error: "No content details found for the provided IDs" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const contentTypeLabel = CONTENT_TYPE_LABELS[campaign.content_type] || 'Content';

    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://picocareer.com';

    // Generate appropriate subject line
    const emailSubject = campaign.subject || getEmailSubject(campaign.content_type);

    // Get recipient's name if available
    const recipientName = recipients[0]?.full_name || "Valued Member";

    const emailContent = generateEmailContent(
      emailSubject,
      campaign.body || `Check out these featured ${campaign.content_type}!`,
      recipientName,
      campaign.id,
      contentList,
      campaign.content_type,
      siteUrl
    );

    const startTime = Date.now();
    
    const { sent, failed, errors } = await processBatchSending(
      recipients, 
      emailSubject, 
      emailContent, 
      campaign.id,
      batchSize,
      supabaseClient
    );

    const executionTime = (Date.now() - startTime) / 1000;

    const status = sent > 0 ? (failed > 0 ? 'partial' : 'sent') : 'failed';
    await updateCampaignStatus(supabaseClient, campaignId, status, sent, failed, recipients.length);

    if (sent === 0) {
      console.error("Zero emails sent for campaign:", campaignId, "errors:", errors);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to send emails to any recipients.",
          details: errors
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        campaign_id: campaignId,
        total_recipients: recipients.length,
        sent,
        failed,
        execution_time_seconds: executionTime,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Unexpected error in send-campaign-emails:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message || "Unexpected error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
