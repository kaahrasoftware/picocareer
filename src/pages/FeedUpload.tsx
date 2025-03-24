
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { getFeedFormFields, RESOURCE_TYPES } from "@/components/forms/feed/FeedFormFields";
import { Card } from "@/components/ui/card";
import { useAuthSession } from "@/hooks/useAuthSession";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function FeedUpload() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resourceType, setResourceType] = useState("text");
  const [formFields, setFormFields] = useState(getFeedFormFields("text"));

  // Update form fields when resource type changes
  useEffect(() => {
    setFormFields(getFeedFormFields(resourceType));
  }, [resourceType]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (!session?.user?.id || !profile?.id) {
        throw new Error("You must be logged in to upload resources");
      }

      // Add additional metadata
      const resourceData = {
        ...data,
        author_id: session.user.id,
        mentor_id: profile.id,
        resource_type: resourceType,
        status: 'Published',
        created_at: new Date().toISOString(),
        size_in_bytes: data.file_url ? await getFileSizeFromUrl(data.file_url) : 0,
      };

      // Insert into mentor_resources table
      const { error } = await supabase
        .from('mentor_resources')
        .insert([resourceData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resource has been uploaded successfully",
      });

      navigate("/profile");
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

  // Helper to estimate file size from URL
  const getFileSizeFromUrl = async (url: string): Promise<number> => {
    if (!url) return 0;
    
    try {
      // Try to get size from metadata if possible
      // For simplicity, return default values based on resource type
      if (resourceType === 'image') return 500000; // 500KB
      if (resourceType === 'video') return 5000000; // 5MB
      if (resourceType === 'audio') return 2000000; // 2MB
      if (resourceType === 'document') return 1000000; // 1MB
      return 100000; // Default 100KB
    } catch (error) {
      console.error('Error determining file size:', error);
      return 0;
    }
  };

  // Check if user is logged in and is a mentor
  const isMentor = profile?.role === 'mentor' || profile?.is_mentor;

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div>Please sign in to upload resources</div>
      </div>
    );
  }

  if (!isMentor) {
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
          Share valuable resources with your mentees and the community
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <Label htmlFor="resource-type-selector">Resource Type</Label>
          <Select
            value={resourceType}
            onValueChange={(value) => setResourceType(value)}
          >
            <SelectTrigger id="resource-type-selector" className="w-full">
              <SelectValue placeholder="Select resource type" />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <GenericUploadForm 
          fields={formFields}
          onSubmit={handleSubmit}
          buttonText="Upload Resource"
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
}
