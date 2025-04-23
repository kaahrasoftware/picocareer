import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CampaignEmailRequest {
  campaignId: string;
  batchSize?: number;
}

// Content detail fetch helpers
async function fetchScholarshipDetails(supabase: any, contentIds: string[]) {
  const { data, error } = await supabase
    .from('scholarships')
    .select('id, title, description, deadline, image_url')
    .in('id', contentIds);
  
  if (error) throw new Error(`Error fetching scholarships: ${error.message}`);
  return data || [];
}

async function fetchOpportunityDetails(supabase: any, contentIds: string[]) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('id, title, description, provider_name, compensation, location, remote, deadline, cover_image_url')
    .in('id', contentIds);
  
  if (error) throw new Error(`Error fetching opportunities: ${error.message}`);
  return data || [];
}

async function fetchCareerDetails(supabase: any, contentIds: string[]) {
  const { data, error } = await supabase
    .from('careers')
    .select('id, title, description, salary_range, image_url')
    .in('id', contentIds);
  
  if (error) throw new Error(`Error fetching careers: ${error.message}`);
  return data || [];
}

async function fetchMajorDetails(supabase: any, contentIds: string[]) {
  const { data, error } = await supabase
    .from('majors')
    .select('id, title, description, potential_salary, job_prospects, image_url')
    .in('id', contentIds);
  
  if (error) throw new Error(`Error fetching majors: ${error.message}`);
  return data || [];
}

async function fetchMentorDetails(supabase: any, contentIds: string[]) {
  console.log("Fetching mentor details for:", contentIds);
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      bio,
      avatar_url,
      skills,
      position,
      careers:position(title)
    `)
    .in('id', contentIds)
    .eq('user_type', 'mentor');

  if (error) throw new Error(`Error fetching mentors: ${error.message}`);
  
  console.log("Raw mentor data:", data);

  // Map: use position title from careers join for professional_title
  const transformedData = (data || []).map((mentor: any) => {
    const transformed = {
      ...mentor,
      professional_title: mentor.careers?.title || ""
    };
    return transformed;
  });
  
  console.log("Transformed mentor data:", transformedData);
  return transformedData;
}

async function fetchBlogDetails(supabase: any, contentIds: string[]) {
  const { data, error } = await supabase
    .from('blogs')
    .select('id, title, summary, cover_image_url, categories')
    .in('id', contentIds);
  
  if (error) throw new Error(`Error fetching blogs: ${error.message}`);
  return data || [];
}

async function fetchSchoolDetails(supabase: any, contentIds: string[]) {
  const { data, error } = await supabase
    .from('schools')
    .select('id, name, status, country, state, website, banner_url, logo_url')
    .in('id', contentIds);
  if (error) throw new Error(`Error fetching schools: ${error.message}`);
  return data || [];
}

// Helper to format content for email
function formatContentForEmail(content: any, contentType: string, siteUrl: string): string {
  const imgSrc = getImageUrl(content, contentType);
  const imgHtml = imgSrc 
    ? `<img src="${imgSrc}" alt="${content.title || 'Content'}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px;">`
    : ''; // Fallback to empty string if no image
  
  const detailsHtml = getContentDetails(content, contentType);
  const contentUrl = getContentUrl(content.id, contentType, siteUrl);
  
  return `
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: white;">
      <div style="padding: 16px;">
        ${imgHtml}
        <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: #2a2a72;">${content.title || 'Untitled'}</h3>
        ${detailsHtml}
        <div style="margin-top: 16px;">
          <a href="${contentUrl}" style="display: inline-block; background-color: #2a2a72; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: 600;">Learn More</a>
        </div>
      </div>
    </div>
  `;
}

function getImageUrl(content: any, contentType: string): string | null {
  switch (contentType) {
    case 'blogs':
      return content.cover_image_url;
    case 'scholarships':
    case 'careers':
    case 'majors':
      return content.image_url;
    case 'opportunities':
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
  switch (contentType) {
    case 'blogs':
      return `${siteUrl}/blog/${id}`;
    case 'scholarships':
      return `${siteUrl}/scholarships/${id}`;
    case 'opportunities':
      return `${siteUrl}/opportunities/${id}`;
    case 'careers':
      return `${siteUrl}/career/${id}`;
    case 'majors':
      return `${siteUrl}/program/${id}`;
    case 'mentors':
      return `${siteUrl}/mentor/${id}`;
    case 'schools':
      return `${siteUrl}/school/${id}`;
    default:
      return siteUrl;
  }
}

function getContentDetails(content: any, contentType: string): string {
  switch (contentType) {
    case 'blogs':
      return `
        <p style="color: #4b5563; margin-bottom: 8px;">${content.summary || 'No summary available'}</p>
        ${content.categories ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Categories: ${Array.isArray(content.categories) ? content.categories.join(', ') : content.categories}</p>` : ''}
      `;
    case 'scholarships':
      return `
        <p style="color: #4b5563; margin-bottom: 8px;">${content.description ? content.description.substring(0, 150) + '...' : 'No description available'}</p>
        ${content.deadline ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Deadline: ${new Date(content.deadline).toLocaleDateString()}</p>` : ''}
      `;
    case 'opportunities':
      return `
        <p style="color: #4b5563; margin-bottom: 8px;">${content.description ? content.description.substring(0, 150) + '...' : 'No description available'}</p>
        ${content.provider_name ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Provider: ${content.provider_name}</p>` : ''}
        ${content.compensation ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Compensation: ${content.compensation}</p>` : ''}
        ${content.location ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">${content.location}${content.remote ? ' (Remote)' : ''}</p>` : ''}
      `;
    case 'careers':
      return `
        <p style="color: #4b5563; margin-bottom: 8px;">${content.description ? content.description.substring(0, 150) + '...' : 'No description available'}</p>
        ${content.salary_range ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Salary Range: ${content.salary_range}</p>` : ''}
      `;
    case 'majors':
      return `
        <p style="color: #4b5563; margin-bottom: 8px;">${content.description ? content.description.substring(0, 150) + '...' : 'No description available'}</p>
        ${content.job_prospects ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Job Prospects: ${content.job_prospects}</p>` : ''}
        ${content.potential_salary ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Potential Salary: ${content.potential_salary}</p>` : ''}
      `;
    case 'mentors':
      return `
        <p style="color: #4b5563; margin-bottom: 8px;">${content.bio ? content.bio.substring(0, 150) + '...' : 'No bio available'}</p>
        ${content.professional_title ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">${content.professional_title}</p>` : ''}
        ${content.skills ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Skills: ${Array.isArray(content.skills) ? content.skills.slice(0, 3).join(', ') + (content.skills.length > 3 ? '...' : '') : content.skills}</p>` : ''}
      `;
    case 'schools':
      return `
        <p style="color: #4b5563; margin-bottom: 8px;">${content.name || 'Unnamed School'}</p>
        ${content.status ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Status: ${content.status}</p>` : ''}
        ${content.country ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Country: ${content.country}${content.state ? ', ' + content.state : ''}</p>` : ''}
        ${content.website ? `<p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Website: <a href="${content.website}">${content.website}</a></p>` : ''}
      `;
    default:
      return `<p style="color: #4b5563;">No details available.</p>`;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let campaignId, batchSize;
    try {
      const json = await req.json();
      campaignId = json.campaignId;
      batchSize = json.batchSize ?? 50;
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

    // Load campaign details
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

    // Get recipients
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
      return new Response(
        JSON.stringify({ success: false, error: "Error fetching recipients: " + (error as Error).message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (recipients.length === 0) {
      console.warn("No recipients found for this campaign:", campaignId);
      return new Response(
        JSON.stringify({ success: false, error: "No recipients found for this campaign" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all content IDs from the campaign
    let contentIds: string[] = [];
    if (campaign.content_ids && Array.isArray(campaign.content_ids) && campaign.content_ids.length > 0) {
      contentIds = campaign.content_ids;
    } else if (campaign.content_type && campaign.content_id) {
      contentIds = [campaign.content_id];
    }

    if (contentIds.length === 0) {
      console.error("No content IDs found in campaign:", campaignId);
      return new Response(
        JSON.stringify({ success: false, error: "No content IDs found in campaign" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Fetch content details based on content type
    let contentList: any[] = [];
    try {
      if (campaign.content_type === 'scholarships') {
        contentList = await fetchScholarshipDetails(supabaseClient, contentIds);
      } else if (campaign.content_type === 'opportunities') {
        contentList = await fetchOpportunityDetails(supabaseClient, contentIds);
      } else if (campaign.content_type === 'careers') {
        contentList = await fetchCareerDetails(supabaseClient, contentIds);
      } else if (campaign.content_type === 'majors') {
        contentList = await fetchMajorDetails(supabaseClient, contentIds);
      } else if (campaign.content_type === 'mentors') {
        contentList = await fetchMentorDetails(supabaseClient, contentIds);
      } else if (campaign.content_type === 'blogs') {
        contentList = await fetchBlogDetails(supabaseClient, contentIds);
      } else if (campaign.content_type === 'schools') {
        contentList = await fetchSchoolDetails(supabaseClient, contentIds);
      } else {
        throw new Error(`Unknown content type: ${campaign.content_type}`);
      }
    } catch (error) {
      console.error("Error fetching content details:", error);
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
      return new Response(
        JSON.stringify({ success: false, error: "No content details found for the provided IDs" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get content type title for email subject
    const contentTypeLabel = {
      'scholarships': 'Scholarship',
      'opportunities': 'Opportunity',
      'careers': 'Career',
      'majors': 'Major',
      'schools': 'School',
      'mentors': 'Mentor',
      'blogs': 'Blog'
    }[campaign.content_type] || 'Content';

    // Email subject
    const emailSubject = campaign.subject || `${contentTypeLabel} Spotlight: ${contentList.length > 1 ? `${contentList.length} New Items` : contentList[0].title || contentList[0].full_name || 'Featured Content'}`;

    // Use Resend for email delivery only
    const batchedRecipients = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      batchedRecipients.push(recipients.slice(i, i + batchSize));
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors = [];
    const processedRecipientIds: string[] = [];
    const startTime = Date.now();
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://picocareer.com';

    // Processing email sending
    for (let batchIndex = 0; batchIndex < batchedRecipients.length; batchIndex++) {
      const batch = batchedRecipients[batchIndex];
      const batchPromises = batch.map(async (recipient) => {
        try {
          // Generate email content with all items in contentList
          const emailContent = generateEmailContent(
            emailSubject,
            campaign.body || `Check out these featured ${campaign.content_type}!`,
            recipient.full_name || "Valued Member",
            campaign.id,
            contentList,
            campaign.content_type,
            siteUrl
          );

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
          const errMsg = (error as Error).message || error;
          errors.push({ recipient_id: recipient.id, email: recipient.email, error: errMsg });
          console.error("Email send failure:", recipient.email, errMsg);
          return { success: false, recipient_id: recipient.id, email: recipient.email, error: errMsg };
        }
      });
      await Promise.all(batchPromises);
      if (batchIndex < batchedRecipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const executionTime = (Date.now() - startTime) / 1000;

    const campaignUpdateData: any = {
      status: sentCount > 0 ? (failedCount > 0 ? 'partial' : 'sent') : 'failed',
      sent_at: new Date().toISOString(),
      recipients_count: recipients.length,
      sent_count: sentCount,
      failed_count: failedCount
    };

    try {
      const { error: updateError } = await supabaseClient
        .from('email_campaigns')
        .update(campaignUpdateData)
        .eq('id', campaignId);
      if (updateError) {
        console.error("Failed to update campaign status:", updateError.message);
      }
    } catch (_updateErr) {
      // ignore update errors, already logged
    }

    if (sentCount === 0) {
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

    // Success!
    return new Response(
      JSON.stringify({
        success: true,
        campaign_id: campaignId,
        total_recipients: recipients.length,
        sent: sentCount,
        failed: failedCount,
        execution_time_seconds: executionTime,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    // Top-level error handler
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

function generateEmailContent(
  title: string,
  body: string,
  recipientName: string,
  campaignId: string,
  contentItems: any[],
  contentType: string,
  siteUrl: string
): string {
  const unsubscribeUrl = `${siteUrl}/unsubscribe?campaign=${campaignId}`;
  
  // Generate content cards HTML
  let contentCardsHtml = '';
  if (contentItems.length > 0) {
    contentItems.forEach(item => {
      contentCardsHtml += formatContentForEmail(item, contentType, siteUrl);
    });
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #f9f9fb;">
      <div style="background-color: #2a2a72; color: white; padding: 16px 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px -20px;">
        <h1 style="margin: 0; font-size: 24px;">${title}</h1>
      </div>
      
      <p style="margin-top: 0; color: #374151;">Hello ${recipientName},</p>
      
      <div style="margin: 20px 0; color: #374151;">
        ${body}
      </div>
      
      <div style="margin: 30px 0;">
        ${contentCardsHtml}
      </div>
      
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin-top: 30px;">
        <p style="margin-top: 0; color: #4b5563;">
          Visit <a href="${siteUrl}" style="color: #2a2a72; text-decoration: none; font-weight: bold;">PicoCareer</a> 
          to discover more opportunities tailored to your interests.
        </p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #6b7280; text-align: center;">
        <p>&copy; ${new Date().getFullYear()} PicoCareer. All rights reserved.</p>
        <div style="margin-top: 8px;">
          <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> from these emails.
        </div>
      </div>
    </div>
  `;
}

serve(handler);
