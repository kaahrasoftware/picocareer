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
import { getRandomIndexes } from "./email-campaign-form/helpers";
import { useEmailCampaignFormState } from "./email-campaign-form/useEmailCampaignFormState";
import { handleEmailCampaignFormSubmit } from "./email-campaign-form/useEmailCampaignFormSubmit";

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

  useEmailCampaignFormState({
    contentType, randomSelect, randomCount,
    setContentList, setSelectedContentIds, setLoadingContent,
    setRecipientsList, recipientType
  });

  useEffect(() => {
    if (randomSelect && contentList.length > 0) {
      const count = Math.min(randomCount, contentList.length);
      const randomIndexes = getRandomIndexes(contentList.length, count);
      setSelectedContentIds(randomIndexes.map(idx => contentList[idx].id));
    }
  }, [randomSelect, contentList, randomCount]);

  async function handleSubmit(e: React.FormEvent) {
    await handleEmailCampaignFormSubmit({
      e, adminId, contentList, selectedContentIds, frequency, scheduledFor,
      contentType, recipientType, selectedRecipients, onCampaignCreated,
      setSubmitting, setSelectedContentIds, setSelectedRecipients
    });
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
