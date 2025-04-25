
import React from "react";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { CONTENT_TYPE_LABELS, ContentType } from "../email-campaign-form/utils";

interface EmailTemplatePreviewProps {
  contentType: ContentType;
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
  primaryColor,
  secondaryColor,
  accentColor,
  layoutSettings
}: EmailTemplatePreviewProps) {
  const defaultSettings = {
    headerStyle: 'centered',
    showAuthor: true,
    showDate: true,
    imagePosition: 'top',
    contentBlocks: ['title', 'image', 'description', 'cta'],
    metadataDisplay: ['category', 'date']
  };
  
  const settings = layoutSettings || defaultSettings;
  
  // Generate sample content based on content type
  const sampleContent = useMemo(() => {
    return generateSampleContent(contentType);
  }, [contentType]);

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
            {CONTENT_TYPE_LABELS[contentType]}
          </h2>
          {settings.headerStyle === 'minimal' && <div className="h-1 w-20 mt-2" style={{ backgroundColor: accentColor }}></div>}
        </div>
        
        {/* Email Content */}
        <div className="p-4">
          {/* Content rendering based on layout settings */}
          {settings.contentBlocks?.includes('title') && (
            <h3 className="text-lg font-bold mb-2">{sampleContent.title}</h3>
          )}
          
          {settings.showAuthor && settings.metadataDisplay?.includes('author') && (
            <div className="text-sm text-gray-600 mb-2">
              By {sampleContent.author}
            </div>
          )}
          
          {settings.showDate && settings.metadataDisplay?.includes('date') && (
            <div className="text-sm text-gray-600 mb-3">
              {sampleContent.date}
            </div>
          )}
          
          {settings.contentBlocks?.includes('image') && (
            <div className={`mb-4 ${getImageContainerClass(settings.imagePosition)}`}>
              <div 
                className={`bg-gray-200 rounded ${getImageSizeClass(settings.imagePosition)}`}
                style={{ 
                  height: settings.imagePosition === 'side' ? '80px' : '120px'
                }}
              >
                <div className="flex items-center justify-center h-full text-gray-400">
                  [Image]
                </div>
              </div>
              
              {settings.imagePosition === 'side' && (
                <div className="flex-1 pl-4">
                  {settings.contentBlocks?.includes('description') && (
                    <p className="text-sm text-gray-700">{sampleContent.description}</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {settings.imagePosition !== 'side' && settings.contentBlocks?.includes('description') && (
            <p className="text-sm text-gray-700 mb-4">{sampleContent.description}</p>
          )}
          
          {settings.contentBlocks?.includes('cta') && (
            <div className="mt-4">
              <button
                className="px-4 py-2 rounded text-white text-sm"
                style={{ backgroundColor: accentColor }}
              >
                Read More
              </button>
            </div>
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
