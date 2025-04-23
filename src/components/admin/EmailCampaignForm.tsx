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

type ContentType = "scholarships" | "opportunities" | "careers" | "majors" | "schools" | "mentors" | "blogs";
type RecipientType = 'all' | 'mentees' | 'mentors' | 'selected';

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  scholarships: "Scholarship Spotlight",
  opportunities: "Opportunity Spotlight",
  careers: "Career Spotlight",
  majors: "Major Spotlight",
  schools: "School Spotlight",
  mentors: "Mentor Spotlight",
  blogs: "Blog Spotlight",
};

function getRandomIndexes(arrayLength: number, count: number) {
  const result: number[] = [];
  const min = Math.min(count, arrayLength);
  while (result.length < min) {
    const randomIndex = Math.floor(Math.random() * arrayLength);
    if (!result.includes(randomIndex)) {
      result.push(randomIndex);
    }
  }
  return result;
}

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
          ({ data: content } = await supabase.from("opportunities").select("id, title").eq("status", "Approved"));
          break;
        case "careers":
          ({ data: content } = await supabase.from("careers").select("id, title").eq("status", "Approved"));
          break;
        case "majors":
          ({ data: content } = await supabase.from("majors").select("id, title").eq("status", "Approved"));
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
          ({ data: content } = await supabase.from("blogs").select("id, title").eq("status", "Approved"));
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
        recipients_count: 0
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
        description: `Scheduled ${campaignInserts.length} campaign(s).` 
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
          <div>
            <label htmlFor="contentType" className="block font-medium mb-1">Content Type</label>
            <select
              id="contentType"
              value={contentType}
              onChange={e => { 
                setContentType(e.target.value as ContentType)
                setRandomSelect(false);
                setRandomCount(1);
              }}
              className="w-full border px-3 py-2 rounded"
            >
              {Object.keys(CONTENT_TYPE_LABELS).map(type => (
                <option key={type} value={type}>{CONTENT_TYPE_LABELS[type as ContentType]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="selectContent" className="block font-medium mb-1">Select Content</label>
            {loadingContent ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin w-4 h-4" /> Loading...
              </div>
            ) : (
              <select
                id="selectContent"
                multiple
                disabled={randomSelect}
                value={selectedContentIds}
                onChange={e => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedContentIds(options);
                }}
                className="w-full border px-3 py-2 rounded min-h-[4rem]"
                required={!randomSelect}
                size={Math.min(Math.max(4, contentList.length), 8)}
              >
                {contentList.map(option => (
                  <option key={option.id} value={option.id}>{option.title}</option>
                ))}
              </select>
            )}
            <div className="flex items-center space-x-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={randomSelect}
                  onChange={e => setRandomSelect(e.target.checked)}
                  className="mr-2"
                />
                Select Random
              </label>
              {randomSelect && (
                <input
                  type="number"
                  min={1}
                  max={contentList.length || 1}
                  value={randomCount}
                  onChange={e => setRandomCount(Math.max(1, Math.min(Number(e.target.value), contentList.length || 1)))}
                  className="w-20 border px-2 py-1 rounded"
                  disabled={!randomSelect}
                />
              )}
              {randomSelect && (
                <span className="text-xs text-muted-foreground">
                  (Selects {randomCount} random)
                </span>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="frequency" className="block font-medium mb-1">Frequency</label>
            <select id="frequency" value={frequency} onChange={e => setFrequency(e.target.value as any)} className="w-full border px-3 py-2 rounded">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label htmlFor="scheduledFor" className="block font-medium mb-1">Start Date/Time</label>
            <input
              id="scheduledFor"
              type="datetime-local"
              value={scheduledFor}
              onChange={e => setScheduledFor(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Email Preview</label>
            <div className="border bg-muted rounded px-3 py-4 text-sm">
              {selectedContentIds.length === 0
                ? "(Nothing selected)"
                : selectedContentIds.map(id => {
                    const content = contentList.find(c => c.id === id);
                    return (
                      <div key={id} className="mb-4 border-b last:border-b-0 pb-2 last:pb-0">
                        {getEmailTemplate(content)}
                      </div>
                    );
                  })}
            </div>
          </div>
          <div>
            <Label>Recipient Type</Label>
            <Select 
              value={recipientType} 
              onValueChange={(value: RecipientType) => setRecipientType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="mentees">Mentees Only</SelectItem>
                <SelectItem value="mentors">Mentors Only</SelectItem>
                <SelectItem value="selected">Select Specific Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recipientType === 'selected' && (
            <div className="grid gap-2 max-h-64 overflow-y-auto border rounded p-2">
              {recipientsList.map(recipient => (
                <div key={recipient.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`recipient-${recipient.id}`}
                    checked={selectedRecipients.includes(recipient.id)}
                    onCheckedChange={(checked) => {
                      setSelectedRecipients(prev => 
                        checked 
                          ? [...prev, recipient.id] 
                          : prev.filter(id => id !== recipient.id)
                      );
                    }}
                  />
                  <Label 
                    htmlFor={`recipient-${recipient.id}`}
                    className="text-sm"
                  >
                    {recipient.full_name || recipient.email}
                  </Label>
                </div>
              ))}
            </div>
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
