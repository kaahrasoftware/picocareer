
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type ContentType = "scholarships" | "opportunities" | "careers" | "majors" | "schools" | "mentors" | "blogs";

type ContentOption = { id: string; title: string };

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  scholarships: "Scholarship Spotlight",
  opportunities: "Opportunity Spotlight",
  careers: "Career Spotlight",
  majors: "Major Spotlight",
  schools: "School Spotlight",
  mentors: "Mentor Spotlight",
  blogs: "Blog Spotlight",
};

/**
 * Form for admins to create and schedule content spotlight campaigns
 */
export function EmailCampaignForm({ adminId }: { adminId: string }) {
  const [contentType, setContentType] = useState<ContentType>("scholarships");
  const [contentList, setContentList] = useState<ContentOption[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string>("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [scheduledFor, setScheduledFor] = useState<string>(""); // ISO date-time string
  const [loadingContent, setLoadingContent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load the appropriate content list on contentType change
  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      setLoadingContent(true);
      setContentList([]);
      setSelectedContentId("");
      let content: ContentOption[] = [];
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
  
  function getEmailTemplate(content: ContentOption | undefined) {
    const label = CONTENT_TYPE_LABELS[contentType];
    const previewTitle = content ? `${label}: ${content.title}` : label;
    switch (contentType) {
      case "scholarships":
      case "opportunities":
      case "majors":
      case "careers":
      case "schools":
      case "mentors":
      case "blogs":
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedContentId || !contentType || !frequency || !scheduledFor) {
      toast({ title: "Fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const content = contentList.find(c => c.id === selectedContentId);
      const subject = `${CONTENT_TYPE_LABELS[contentType]}: ${content?.title}`;
      const body = `${subject}\n\nVisit PicoCareer to learn more about this featured ${contentType.slice(0, -1)}.`;
      const { error } = await supabase.from("email_campaigns").insert([{
        scheduled_for: scheduledFor,
        frequency,
        content_type: contentType,
        content_id: selectedContentId,
        subject,
        body,
        admin_id: adminId,
      }]);
      if (error) throw error;
      toast({ title: "Campaign created!", description: "Your campaign has been scheduled." });
      setSelectedContentId("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  }

  return (
    <Card>
      <CardContent className="py-8">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div>
            <label htmlFor="contentType" className="block font-medium mb-1">Content Type</label>
            <select id="contentType" value={contentType} onChange={e => setContentType(e.target.value as ContentType)} className="w-full border px-3 py-2 rounded">
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
                value={selectedContentId}
                onChange={e => setSelectedContentId(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select...</option>
                {contentList.map(option => (
                  <option key={option.id} value={option.id}>{option.title}</option>
                ))}
              </select>
            )}
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
            <div className="border bg-muted rounded px-3 py-4 text-sm">{getEmailTemplate(contentList.find(c => c.id === selectedContentId))}</div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting || !selectedContentId}>
            {submitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Create Campaign"}
            {submitting ? "Creating..." : ""}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
