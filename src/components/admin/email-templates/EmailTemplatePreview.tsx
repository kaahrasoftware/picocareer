import React from "react";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { CONTENT_TYPE_LABELS, ContentType } from "../email-campaign-form/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmailTemplateContent } from "@/types/database/email";

interface EmailTemplatePreviewProps {
  contentType: ContentType;
  adminId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  layoutSettings?: {
    headerStyle: 'centered' | 'banner' | 'minimal';
    showAuthor: boolean;
    showDate: boolean;
    imagePosition: 'top' | 'inline' | 'side';
    contentBlocks?: string[];
    metadataDisplay?: string[];
  };
}

export function EmailTemplatePreview({
  contentType,
  adminId,
  primaryColor,
  secondaryColor,
  accentColor,
  layoutSettings
}: EmailTemplatePreviewProps) {
  const { data: templateContent, isLoading: loadingContent } = useQuery({
    queryKey: ['email-template-content', contentType, adminId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_template_content')
        .select('*')
        .eq('content_type', contentType)
        .eq('admin_id', adminId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as EmailTemplateContent;
    }
  });

  const defaultSettings = {
    headerStyle: 'centered' as const,
    showAuthor: true,
    showDate: true,
    imagePosition: 'top' as const,
    contentBlocks: ['title', 'image', 'description', 'cta'],
    metadataDisplay: ['category', 'date']
  };
  
  const settings = layoutSettings || defaultSettings;
  
  // Generate sample content based on content type
  const sampleContent = useMemo(() => {
    return generateSampleContent(contentType);
  }, [contentType]);

  if (loadingContent) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-md border">
      <h3 className="text-sm font-medium mb-3">Live Preview</h3>
      
      <div className="bg-white shadow-sm rounded-md overflow-hidden border">
        {/* Email Header */}
        <div 
          className={`p-4 ${settings.headerStyle === 'banner' ? 'py-8' : 'py-4'}`}
          style={{
            background: settings.headerStyle === 'banner' 
              ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
              : 'white',
            color: settings.headerStyle === 'banner' ? 'white' : 'inherit',
            textAlign: settings.headerStyle === 'centered' ? 'center' : 'left'
          }}
        >
          <h2 className="text-xl font-bold" style={{ color: settings.headerStyle === 'banner' ? 'white' : primaryColor }}>
            {templateContent?.header_text || CONTENT_TYPE_LABELS[contentType]}
          </h2>
          {settings.headerStyle === 'minimal' && <div className="h-1 w-20 mt-2" style={{ backgroundColor: accentColor }}></div>}
        </div>
        
        {/* Email Content */}
        <div className="p-4">
          {/* Intro Text */}
          {templateContent?.intro_text && (
            <p className="text-gray-700 text-sm mb-4">
              {templateContent.intro_text}
            </p>
          )}

          {/* Sample Content Card */}
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-medium text-lg mb-2">{sampleContent.title}</h3>
            <p className="text-gray-600 text-sm">{sampleContent.description}</p>
            
            {settings.contentBlocks?.includes('cta') && templateContent?.cta_text && (
              <button
                className="mt-4 px-4 py-2 rounded text-white text-sm"
                style={{ backgroundColor: accentColor }}
              >
                {templateContent.cta_text}
              </button>
            )}
          </div>

          {/* Footer Text */}
          {templateContent?.footer_text && (
            <p className="text-gray-500 text-sm text-center mt-6">
              {templateContent.footer_text}
            </p>
          )}
        </div>
        
        {/* Email Footer */}
        <div className="border-t p-4 text-xs text-center text-gray-500">
          <p>View this email in your browser | Unsubscribe</p>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getImageContainerClass(position: 'top' | 'inline' | 'side') {
  switch (position) {
    case 'side':
      return 'flex flex-row items-start';
    case 'inline':
    case 'top':
    default:
      return 'block';
  }
}

function getImageSizeClass(position: 'top' | 'inline' | 'side') {
  switch (position) {
    case 'side':
      return 'w-1/3 flex-shrink-0';
    case 'inline':
      return 'w-1/2 mx-auto';
    case 'top':
    default:
      return 'w-full';
  }
}

// Sample content generator
function generateSampleContent(contentType: ContentType) {
  const base = {
    author: 'John Smith',
    date: new Date().toLocaleDateString(),
  };
  
  switch (contentType) {
    case 'scholarships':
      return {
        ...base,
        title: 'Merit Scholarship Opportunity',
        description: 'A new scholarship opportunity for students with outstanding academic achievements. This scholarship covers tuition and provides a monthly stipend.'
      };
    case 'opportunities':
      return {
        ...base,
        title: 'Summer Internship Program',
        description: 'Join our 10-week summer internship program and gain hands-on experience working with industry professionals on cutting-edge projects.'
      };
    case 'careers':
      return {
        ...base,
        title: 'Career Path: Data Science',
        description: 'Explore the rapidly growing field of data science, including required skills, typical job responsibilities, and salary expectations.'
      };
    case 'majors':
      return {
        ...base,
        title: 'Computer Science Major Spotlight',
        description: 'Learn about the computer science curriculum, potential career paths, and industry partnerships available to CS majors.'
      };
    case 'schools':
      return {
        ...base,
        title: 'University of Technology Highlight',
        description: 'Discover what makes the University of Technology stand out, including academic programs, campus life, and admission requirements.'
      };
    case 'mentors':
      return {
        ...base,
        title: 'Meet Dr. Lisa Johnson - Tech Leader',
        description: 'Dr. Johnson is a tech industry veteran with 15+ years of experience who specializes in helping students transition to tech careers.'
      };
    case 'blogs':
      return {
        ...base,
        title: 'How to Prepare for Technical Interviews',
        description: 'Expert tips and strategies to help you ace your next technical interview, from preparation to follow-up.'
      };
    default:
      return {
        ...base,
        title: 'Sample Content Title',
        description: 'This is sample content to demonstrate the email template layout.'
      };
  }
}
