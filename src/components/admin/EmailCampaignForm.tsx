import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ContentTypeSelector } from "./email-campaign-form/ContentTypeSelector";
import { ContentSelect } from "./email-campaign-form/ContentSelect";
import { FrequencySelector } from "./email-campaign-form/FrequencySelector";
import { ScheduleDateTimeInput } from "./email-campaign-form/ScheduleDateTimeInput";
import { EmailPreview } from "./email-campaign-form/EmailPreview";
import { RecipientTypeSelector } from "./email-campaign-form/RecipientTypeSelector";
import { RecipientSelection } from "./email-campaign-form/RecipientSelection";
import { CONTENT_TYPE_LABELS, ContentType } from "./email-campaign-form/utils";

type RecipientType = 'all' | 'mentees' | 'mentors' | 'selected';

export function EmailCampaignForm({ 
  adminId, 
  onCampaignCreated 
}: { 
  adminId: string, 
  onCampaignCreated?: () => void 
}) {
  const [contentType, setContentType] = useState<ContentType>("scholarships");
  const [contentList, setContentList] = useState<{id: string, title: string}[]>([]);
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [scheduledFor, setScheduledFor] = useState<string>(""); 
  const [loadingContent, setLoadingContent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [randomSelect, setRandomSelect] = useState(false);
  const [randomCount, setRandomCount] = useState(1);
  const [recipientType, setRecipientType] = useState<RecipientType>('all');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [recipientsList, setRecipientsList] = useState<{id: string, email: string, full_name?: string}[]>([]);

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
          ({ data: content } = await supabase.from("opportunities").select("id, title").eq("status", "approved"));
          break;
        case "careers":
          ({ data: content } = await supabase.from("careers").select("id, title").eq("status", "approved"));
          break;
        case "majors":
          ({ data: content } = await supabase.from("majors").select("id, title").eq("status", "approved"));
          break;
        case "schools":
          ({ data: content } = await supabase.from("schools").select("id, name"));
          content = mapRows(content, "name");
          break;
        case "mentors":
          ({ data: content } = await supabase.from("profiles").select("id, full_name").eq("user_type", "mentor"));
          content = (content || []).map(item => ({
            id: item.id,
            title: item.full_name || "Untitled"
          }));
          break;
        case "blogs":
          ({ data: content } = await supabase.from("blogs").select("id, title").eq("status", "approved"));
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
  }, [contentType]);

  useEffect(() => {
    if (randomSelect && contentList.length > 0) {
      const count = Math.min(randomCount, contentList.length);
      const randomIndexes = getRandomIndexes(contentList.length, count);
      setSelectedContentIds(randomIndexes.map(idx => contentList[idx].id));
    }
  }, [randomSelect, contentList, randomCount]);

  function getEmailTemplate(content: {id: string, title: string} | undefined) {
    const label = CONTENT_TYPE_LABELS[contentType];
    const previewTitle = content ? `${label}: ${content.title}` : label;
    switch (contentType) {
      default:
        return (
          <div>
            <h2 className="text-lg font-bold mb-1">{previewTitle}</h2>
            <p>Hello!</p>
            <p>
              We're excited to feature this {contentType.slice(0, -1)} in our {label.replace("Spotlight", "Spotlight Email")}!
            </p>
            <p><b>{content?.title}</b></p>
            <p>Learn more by clicking the link in this email or visiting our platform.</p>
            <em>— The PicoCareer Team</em>
          </div>
        );
    }
  }

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
  }, [recipientType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contentType || !frequency || !scheduledFor || selectedContentIds.length === 0) {
      toast({ title: "Fill all required fields", variant: "destructive" });
      return;
    }

    // Validate that scheduled time is in the future
    const scheduleDate = new Date(scheduledFor);
    if (scheduleDate <= new Date()) {
      toast({ 
        title: "Invalid schedule time", 
        description: "Scheduled time must be in the future",
        variant: "destructive" 
      });
      return;
    }

    setSubmitting(true);
    try {
      const selectedContents = contentList.filter(c => selectedContentIds.includes(c.id));
      
      const campaignInserts = selectedContents.map(content => ({
        scheduled_for: scheduledFor,
        frequency,
        content_type: contentType,
        content_id: content.id,
        subject: `${CONTENT_TYPE_LABELS[contentType]}: ${content.title}`,
        body: `${CONTENT_TYPE_LABELS[contentType]}: ${content.title}\n\nVisit PicoCareer to learn more about this featured ${contentType.slice(0, -1)}.`,
        admin_id: adminId,
        recipient_type: recipientType,
        recipient_filter: recipientType === 'selected' 
          ? { profile_ids: selectedRecipients } 
          : {},
        sent_at: null,
        failed_count: 0,
        recipients_count: 0,
        status: 'pending', // Set initial status as pending
        error_message: null,
        last_checked_at: null
      }));

      const { data: insertedCampaigns, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert(campaignInserts)
        .select();

      if (campaignError) throw campaignError;

      if (recipientType === 'selected' && insertedCampaigns) {
        const recipientRecords = insertedCampaigns.flatMap(campaign => 
          selectedRecipients.map(recipientId => ({
            campaign_id: campaign.id,
            profile_id: recipientId
          }))
        );

        const { error: recipientError } = await supabase
          .from('email_campaign_recipients')
          .insert(recipientRecords);

        if (recipientError) throw recipientError;
      }

      toast({ 
        title: "Campaign(s) created!", 
        description: `Scheduled ${campaignInserts.length} campaign(s) for ${new Date(scheduledFor).toLocaleString()}.` 
      });
      
      setSelectedContentIds([]);
      setSelectedRecipients([]);
      
      if (onCampaignCreated) {
        onCampaignCreated();
      }
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message, 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="py-8">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <ContentTypeSelector contentType={contentType} setContentType={(v) => { setContentType(v); setRandomSelect(false); setRandomCount(1); }} />

          <ContentSelect 
            contentList={contentList}
            selectedContentIds={selectedContentIds}
            setSelectedContentIds={setSelectedContentIds}
            loadingContent={loadingContent}
            randomSelect={randomSelect}
            setRandomSelect={setRandomSelect}
            randomCount={randomCount}
            setRandomCount={setRandomCount}
            contentType={contentType}
          />

          <FrequencySelector frequency={frequency} setFrequency={setFrequency} />

          <ScheduleDateTimeInput scheduledFor={scheduledFor} setScheduledFor={setScheduledFor} />

          <EmailPreview selectedContentIds={selectedContentIds} contentList={contentList} contentType={contentType} />

          <RecipientTypeSelector recipientType={recipientType} setRecipientType={setRecipientType} />
            
          {recipientType === 'selected' && (
            <RecipientSelection 
              recipientsList={recipientsList}
              selectedRecipients={selectedRecipients}
              setSelectedRecipients={setSelectedRecipients}
            />
          )}
          <Button type="submit" className="w-full" disabled={submitting || selectedContentIds.length === 0}>
            {submitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Create Campaign"}
            {submitting ? "Creating..." : ""}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
