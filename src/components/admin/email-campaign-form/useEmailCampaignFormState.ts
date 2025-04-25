
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CONTENT_TYPE_LABELS, ContentType } from "./utils";

type RecipientType = 'all' | 'mentees' | 'mentors' | 'selected';

interface UseEmailCampaignFormStateProps {
  contentType: ContentType;
  randomSelect: boolean;
  randomCount: number;
  setContentList: React.Dispatch<React.SetStateAction<{id: string, title: string}[]>>;
  setSelectedContentIds: React.Dispatch<React.SetStateAction<string[]>>;
  setLoadingContent: React.Dispatch<React.SetStateAction<boolean>>;
  setRecipientsList: React.Dispatch<React.SetStateAction<{id: string, email: string, full_name?: string}[]>>;
  recipientType: RecipientType;
}

export function useEmailCampaignFormState({
  contentType,
  randomSelect,
  randomCount,
  setContentList,
  setSelectedContentIds,
  setLoadingContent,
  setRecipientsList,
  recipientType
}: UseEmailCampaignFormStateProps) {
  
  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      setLoadingContent(true);
      setContentList([]);
      setSelectedContentIds([]);
      
      try {
        let data;
        
        switch (contentType) {
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
          setLoadingContent(false);
        }
      } catch (error) {
        console.error(`Error loading ${contentType} content:`, error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
        toast({
          title: "Error Loading Content",
          description: `Failed to load ${CONTENT_TYPE_LABELS[contentType]}. Please try again.`,
          variant: "destructive"
        });
        if (isMounted) {
          setContentList([]);
          setLoadingContent(false);
        }
      }
    }
    
    loadContent();
    return () => { isMounted = false; }
  }, [contentType, setContentList, setSelectedContentIds, setLoadingContent]);

  // Recipient loading logic
  useEffect(() => {
    async function loadRecipients() {
      try {
        let query = supabase
          .from('profiles')
          .select('id, email, full_name');

        switch (recipientType) {
          case 'mentees':
            query = query.eq('user_type', 'mentee');
            break;
          case 'mentors':
            query = query.eq('user_type', 'mentor');
            break;
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
  }, [recipientType, setRecipientsList]);
}
