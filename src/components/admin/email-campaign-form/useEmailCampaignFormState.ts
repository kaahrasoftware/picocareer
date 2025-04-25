
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ContentType, CONTENT_TYPE_LABELS } from "./utils";

type RecipientType = 'all' | 'mentees' | 'mentors' | 'selected';

type FormState = {
  subject: string;
  contentType: ContentType;
  contentIds: string[];
  frequency: "once" | "daily" | "weekly" | "monthly";
  scheduledFor: string;
  recipientType: RecipientType;
  recipientIds: string[];
};

interface UseEmailCampaignFormStateProps {
  adminId: string;
}

export const useEmailCampaignFormState = ({ adminId }: UseEmailCampaignFormStateProps) => {
  const [formState, setFormState] = useState<FormState>({
    subject: "",
    contentType: "blogs",
    contentIds: [],
    frequency: "once",
    scheduledFor: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // Default to 1hr from now
    recipientType: 'all',
    recipientIds: []
  });
  
  const [contentList, setContentList] = useState<{id: string, title: string}[]>([]);
  const [recipientsList, setRecipientsList] = useState<{id: string, email: string, full_name?: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const updateFormState = (updates: Partial<FormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  // Load content based on content type
  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      setIsLoading(true);
      
      try {
        let data;
        
        switch (formState.contentType) {
          case "scholarships":
            ({ data } = await supabase
              .from("scholarships")
              .select("id, title")
              .eq("status", "Active"));
            break;
            
          case "opportunities":
            ({ data } = await supabase
              .from("opportunities")
              .select("id, title")
              .eq("status", "Active"));
            break;
            
          case "careers":
            ({ data } = await supabase
              .from("careers")
              .select("id, title")
              .eq("status", "Approved"));
            break;
            
          case "majors":
            ({ data } = await supabase
              .from("majors")
              .select("id, title")
              .eq("status", "Approved"));
            break;
            
          case "schools":
            const { data: schools } = await supabase
              .from("schools")
              .select("id, name")
              .eq("status", "Approved");
            data = schools?.map(school => ({
              id: school.id,
              title: school.name
            }));
            break;
            
          case "mentors":
            const { data: mentors } = await supabase
              .from("profiles")
              .select("id, full_name")
              .eq("user_type", "mentor")
              .eq("onboarding_status", "Approved");
            data = mentors?.map(mentor => ({
              id: mentor.id,
              title: mentor.full_name || 'Unknown Mentor'
            }));
            break;
            
          case "blogs":
            ({ data } = await supabase
              .from("blogs")
              .select("id, title")
              .eq("status", "Approved"));
            break;
            
          default:
            data = [];
        }

        if (isMounted && data) {
          setContentList(data);
          setFormState(prev => ({ ...prev, contentIds: [] })); // Reset selection on content type change
        }
      } catch (error) {
        console.error(`Error loading ${formState.contentType} content:`, error);
        toast({
          title: "Error Loading Content",
          description: `Failed to load ${CONTENT_TYPE_LABELS[formState.contentType]}. Please try again.`,
          variant: "destructive"
        });
        if (isMounted) {
          setContentList([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    loadContent();
    return () => { isMounted = false; }
  }, [formState.contentType, adminId]);

  // Load recipients based on recipient type
  useEffect(() => {
    async function loadRecipients() {
      if (formState.recipientType !== 'selected') {
        setRecipientsList([]);
        return;
      }
      
      try {
        let query = supabase
          .from('profiles')
          .select('id, email, full_name');

        // Use conditional checks instead of direct comparison
        if (formState.recipientType === 'mentees') {
          query = query.eq('user_type', 'mentee');
        } else if (formState.recipientType === 'mentors') {
          query = query.eq('user_type', 'mentor');
        }

        const { data, error } = await query;
        
        if (error) throw error;
        setRecipientsList(data || []);
      } catch (error) {
        console.error('Error loading recipients:', error);
        toast({ 
          title: "Error Loading Recipients", 
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive" 
        });
        setRecipientsList([]);
      }
    }

    loadRecipients();
  }, [formState.recipientType]);

  const hasRequiredFields = 
    formState.subject?.trim() !== "" && 
    formState.contentIds.length > 0 && 
    formState.scheduledFor && 
    (formState.recipientType !== 'selected' || formState.recipientIds.length > 0);

  return {
    formState,
    contentList,
    updateFormState,
    isLoading,
    hasRequiredFields,
    recipientsList
  };
};
