
import React from "react";
import { ContentType } from "../email-campaign-form/utils";

interface EmailTemplatePreviewProps {
  contentType: ContentType;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  layoutSettings?: {
    headerStyle?: string;
    showAuthor?: boolean;
    showDate?: boolean;
    imagePosition?: string;
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
  // Sample content for preview
  const sampleContent = {
    title: `Sample ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Title`,
    description: "This is a sample description for the content that would appear in the email.",
    imageUrl: `/sample-images/${contentType}.jpg`,
    date: new Date().toLocaleDateString(),
    author: "John Doe",
  };

  // Preview HTML
  const previewHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); padding: 32px; text-align: center;">
        <div style="color: white; font-size: 24px; font-weight: bold;">
          ${sampleContent.title}
        </div>
      </div>

      <!-- Content -->
      <div style="padding: 24px;">
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">
          Hello Sample User,
        </p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">
          We have some great ${contentType} recommendations for you!
        </p>

        <!-- Sample Content Card -->
        <div style="margin: 24px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="padding: 16px;">
            <h3 style="margin-top: 0; margin-bottom: 8px; color: ${accentColor}; font-size: 18px;">
              ${sampleContent.title}
            </h3>
            
            ${layoutSettings?.showDate ? 
              `<div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
                ${sampleContent.date}
              </div>` : ''}
              
            ${layoutSettings?.showAuthor ? 
              `<div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
                By ${sampleContent.author}
              </div>` : ''}
              
            <p style="color: #4b5563; margin-bottom: 16px; font-size: 14px;">
              ${sampleContent.description}
            </p>
            
            <a href="#" style="display: inline-block; background-color: ${accentColor}; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">
              Read More
            </a>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          © ${new Date().getFullYear()} PicoCareer. All rights reserved.
        </p>
        <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">
          <a href="#" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;

  return (
    <div className="h-full overflow-auto bg-white p-4 rounded border">
      <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
    </div>
  );
}
