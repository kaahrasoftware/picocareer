
import { useEffect, useState } from "react";
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
      let content: {id: string, title: string}[] = [];
      
      try {
        switch (contentType) {
          case "scholarships":
            ({ data: content } = await supabase
              .from("scholarships")
              .select("id, title")
              .eq("status", "Active"));
            break;
            
          case "opportunities":
            ({ data: content } = await supabase
              .from("opportunities")
              .select("id, title")
              .eq("status", "Active"));
            break;
            
          case "careers":
            ({ data: content } = await supabase
              .from("careers")
              .select("id, title")
              .eq("status", "Approved"));
            break;
            
          case "majors":
            ({ data: content } = await supabase
              .from("majors")
              .select("id, title")
              .eq("status", "Approved"));
            break;
            
          case "schools":
            ({ data: content } = await supabase
              .from("schools")
              .select("id, name")
              .eq("status", "Approved"));
            content = content?.map(school => ({
              id: school.id,
              title: school.name
            }));
            break;
            
          case "mentors":
            console.log('Fetching mentor profiles...');
            ({ data: content } = await supabase
              .from("profiles")
              .select("id, full_name")
              .eq("user_type", "mentor")
              .eq("onboarding_status", "Approved"));
            console.log('Fetched mentors:', content);
            content = content?.map(mentor => ({
              id: mentor.id,
              title: mentor.full_name || 'Unknown Mentor'
            }));
            break;
            
          case "blogs":
            ({ data: content } = await supabase
              .from("blogs")
              .select("id, title")
              .eq("status", "Approved"));
            break;
            
          default:
            content = [];
        }

        if (isMounted) {
          console.log(`Loaded ${contentType} content:`, content);
          setContentList(content || []);
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
  }, [contentType]);

  useEffect(() => {
    setSelectedContentIds(prev => {
      return prev; // intentionally not resetting outside of randomSelect change or contentList population
    });
  }, [setSelectedContentIds]);

  useEffect(() => {
    setSelectedContentIds(prev => {
      return prev;
    });
  }, [setSelectedContentIds]);

  // Recipient loading logic
  useEffect(() => {
    async function loadRecipients() {
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
      
      if (error) {
        toast({ 
          title: "Error Loading Recipients", 
          description: error.message, 
          variant: "destructive" 
        });
        setRecipientsList([]);
        return;
      }

      setRecipientsList(data || []);
    }

    if (recipientType !== 'selected') {
      loadRecipients();
    } else {
      async function loadAllRecipients() {
        const { data: mentees } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('user_type', 'mentee');

        const { data: mentors } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('user_type', 'mentor');

        setRecipientsList([...(mentees || []), ...(mentors || [])]);
      }

      loadAllRecipients();
    }
    // eslint-disable-next-line
  }, [recipientType, setRecipientsList]);
}
