
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CONTENT_TYPE_LABELS, ContentType } from "./utils";
import { getRandomIndexes } from "./helpers";

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
  // Content loading logic
  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      setLoadingContent(true);
      setContentList([]);
      setSelectedContentIds([]);
      let content: {id: string, title: string}[] = [];
      const mapRows = (list: any[] | null, field = "title") => (list || []).map(item => ({
        id: item.id, title: item[field] || item.full_name || "Untitled"
      }));
      switch (contentType) {
        case "scholarships":
          ({ data: content } = await supabase.from("scholarships").select("id, title").eq("status", "Active"));
          break;
        case "opportunities":
          ({ data: content } = await supabase.from("opportunities").select("id, title").eq("status", "Active"));
          break;
        case "careers":
          ({ data: content } = await supabase.from("careers").select("id, title").eq("status", "Active"));
          break;
        case "majors":
          ({ data: content } = await supabase.from("majors").select("id, title").eq("status", "Active"));
          break;
        case "schools":
          ({ data: content } = await supabase.from("schools").select("id, name"));
          content = mapRows(content, "name");
          break;
        case "mentors":
          ({ data: content } = await supabase.from("profiles").select("id, full_name").eq("user_type", "mentor"));
          content = mapRows(content, "full_name");
          break;
        case "blogs":
          ({ data: content } = await supabase.from("blogs").select("id, title").eq("status", "Active"));
          break;
        default: content = [];
      }
      if (isMounted) {
        setContentList(content ? content : []);
        setLoadingContent(false);
      }
    }
    loadContent();
    return () => { isMounted = false; }
    // eslint-disable-next-line
  }, [contentType]);

  // Select random content logic: moved here!
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
