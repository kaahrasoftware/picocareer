
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { feedFormFields } from "@/components/forms/feed/FeedFormFields";
import { Card } from "@/components/ui/card";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function FeedUpload() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    if (!session?.user?.id || !profile?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload resources.",
        variant: "destructive",
      });
      return;
    }

    if (profile.user_type !== 'mentor') {
      toast({
        title: "Permission Denied",
        description: "Only mentors can upload resources.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine content type based on resource type and document type
      let contentType = data.resource_type;
      if (data.resource_type === 'document' && data.document_type) {
        contentType = data.document_type;
      }

      // Calculate size for file uploads
      let sizeInBytes = 0;
      if (data.file_url) {
        // Estimate size based on file type if actual size is unavailable
        if (data.resource_type === 'image') {
          sizeInBytes = 500000; // 500KB estimated for images
        } else if (data.resource_type === 'document') {
          sizeInBytes = 2000000; // 2MB estimated for documents
        } else if (data.resource_type === 'video') {
          sizeInBytes = 10000000; // 10MB estimated for videos
        } else if (data.resource_type === 'audio') {
          sizeInBytes = 3000000; // 3MB estimated for audio
        }
      } else if (data.content) {
        // Estimate size based on content length
        sizeInBytes = data.content.length * 2; // Rough estimate: 2 bytes per character
      }

      // Build metadata
      const metadata = {
        resourceType: data.resource_type,
        documentType: data.document_type || null,
        uploadedAt: new Date().toISOString()
      };

      const { error } = await supabase
        .from('mentor_content')
        .insert([
          {
            mentor_id: profile.id,
            title: data.title,
            description: data.description || '',
            content_type: contentType,
            file_url: data.file_url || null,
            external_url: data.external_url || null,
            size_in_bytes: sizeInBytes,
            metadata: metadata
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your resource has been uploaded successfully.",
      });

      navigate("/profile?tab=dashboard");
    } catch (error: any) {
      console.error('Error uploading resource:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload resource. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div>Please sign in to upload resources</div>
      </div>
    );
  }

  if (profile && profile.user_type !== 'mentor') {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div>Only mentors can upload resources</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Resource</h1>
        <p className="text-muted-foreground mt-2">
          Share your knowledge and resources with mentees
        </p>
      </div>

      <Card className="p-6">
        <GenericUploadForm 
          fields={feedFormFields}
          onSubmit={handleSubmit}
          buttonText="Upload Resource"
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
}
