
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ContentType, CONTENT_TYPE_LABELS } from "../email-campaign-form/utils";
import { EmailHtmlTemplate } from "@/types/database/email";
import { useDebounce } from "@/hooks/useDebounce";

// Monaco Editor
import Editor from "@monaco-editor/react";

const TEMPLATE_TYPES = [
  { value: "header", label: "Header Template" },
  { value: "content_card", label: "Content Card Template" },
  { value: "footer", label: "Footer Template" },
  { value: "base", label: "Base Template" }
];

// Default templates (shown when no templates exist in database)
const DEFAULT_TEMPLATES: Record<string, string> = {
  header: `
<!-- Email Header Template -->
<div style="text-align: center; padding: 24px; margin-bottom: 24px;">
  {{#if logo_url}}
    <img src="{{logo_url}}" alt="Logo" style="height: 40px; margin-bottom: 16px;">
  {{/if}}
  <h1 style="margin: 0; font-size: 26px; font-weight: 600; color: {{primary_color}};">{{title}}</h1>
</div>
  `,
  content_card: `
<!-- Content Card Template -->
<div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: white;">
  <div style="padding: 16px;">
    {{#if image_url}}
      <img 
        src="{{image_url}}" 
        alt="{{title}}"
        style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px; max-width: 600px;"
      />
    {{/if}}
    <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: {{accent_color}}">
      {{title}}
    </h3>
    
    {{#if metadata}}
      <div style="margin-bottom: 10px;">
        {{#each metadata}}
          <p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">{{this}}</p>
        {{/each}}
      </div>
    {{/if}}
    
    <p style="color: #4b5563; margin-bottom: 12px; font-size: 14px;">
      {{description}}
    </p>
    
    <div style="margin-top: 16px;">
      <a 
        href="{{detail_url}}" 
        style="display: inline-block; background: linear-gradient(135deg, {{primary_color}}, {{secondary_color}}); color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: 500;"
      >
        Learn More
      </a>
    </div>
  </div>
</div>
  `,
  footer: `
<!-- Email Footer Template -->
<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
  <p style="color: #6b7280; font-size: 12px;">&copy; {{current_year}} PicoCareer. All rights reserved.</p>
  <p style="color: #6b7280; font-size: 12px;">
    <a href="{{unsubscribe_url}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> from these emails
  </p>
</div>
  `,
  base: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
  </head>
  <body style="margin: 0; padding: 20px; background-color: #f9fafb; 
               font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; 
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
      
      <!-- HEADER TEMPLATE WILL BE INSERTED HERE -->
      {{{header_template}}}
      
      <div style="padding: 0 24px;">
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">
          {{#if recipient_name}}Hello {{recipient_name}},{{else}}Hello,{{/if}}
        </p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">
          {{intro_text}}
        </p>
      </div>

      <div style="padding: 24px;">
        <!-- CONTENT CARDS WILL BE INSERTED HERE -->
        {{{content_cards}}}
      </div>

      <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 16px 0; color: #4b5563;">
          {{cta_text}}
        </p>
        <a 
          href="{{site_url}}" 
          style="display: inline-block; background-color: {{accent_color}}; color: white; 
                 padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                 font-weight: 500;"
        >
          Visit Website
        </a>
      </div>

      <!-- FOOTER TEMPLATE WILL BE INSERTED HERE -->
      {{{footer_template}}}
      
    </div>
  </body>
</html>
  `
};

interface EmailHtmlEditorProps {
  adminId: string;
}

interface PreviewData {
  title: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  site_url: string;
  unsubscribe_url: string;
  recipient_name: string;
  intro_text: string;
  cta_text: string;
  current_year: string;
}

export function EmailHtmlEditor({ adminId }: EmailHtmlEditorProps) {
  const [contentType, setContentType] = useState<ContentType>("blogs");
  const [templateType, setTemplateType] = useState("base");
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState("editor");
  
  const debouncedHtmlContent = useDebounce(htmlContent, 500);
  
  // Preview state
  const [previewData, setPreviewData] = useState<PreviewData>({
    title: "Sample Email Title",
    logo_url: "",
    primary_color: "#4f46e5",
    secondary_color: "#3730a3",
    accent_color: "#4f46e5",
    site_url: "https://example.com",
    unsubscribe_url: "https://example.com/unsubscribe",
    recipient_name: "John Doe",
    intro_text: "Here are some great content recommendations for you!",
    cta_text: "Check out more content on our website",
    current_year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    loadTemplate();
  }, [contentType, templateType, adminId]);

  const loadTemplate = async () => {
    if (!adminId) return;
    
    setLoading(true);
    try {
      // First try to load a content-specific template
      let { data, error } = await supabase
        .from('email_html_templates')
        .select('*')
        .eq('admin_id', adminId)
        .eq('content_type', contentType)
        .eq('template_type', templateType)
        .single();

      // If no content-specific template exists, try to load the universal template
      if (error && error.code === 'PGRST116') {
        const { data: universalData, error: universalError } = await supabase
          .from('email_html_templates')
          .select('*')
          .eq('admin_id', adminId)
          .eq('content_type', 'universal')
          .eq('template_type', templateType)
          .single();
          
        if (!universalError) {
          data = universalData;
          error = null;
        }
      }

      if (error && error.code !== 'PGRST116') { // not found is fine
        throw error;
      }

      if (data) {
        setHtmlContent(data.html_content);
      } else if (initialLoad) {
        // If not found, load default
        setHtmlContent(DEFAULT_TEMPLATES[templateType] || "");
      }
      
      setInitialLoad(false);
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!adminId || !htmlContent.trim()) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_html_templates')
        .upsert(
          {
            admin_id: adminId,
            content_type: contentType,
            template_type: templateType,
            html_content: htmlContent
          },
          {
            onConflict: 'admin_id,content_type,template_type'
          }
        );

      if (error) throw error;
      toast.success("Template saved successfully");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const resetTemplate = () => {
    const defaultTemplate = DEFAULT_TEMPLATES[templateType] || "";
    setHtmlContent(defaultTemplate);
    toast.info("Template reset to default");
  };
  
  // Auto-save when content changes
  useEffect(() => {
    if (!initialLoad && debouncedHtmlContent) {
      saveTemplate();
    }
  }, [debouncedHtmlContent]);

  // Load template colors and settings
  useEffect(() => {
    const loadTemplateSettings = async () => {
      if (!adminId || !contentType) return;
      
      try {
        const { data, error } = await supabase
          .from('email_content_type_settings')
          .select('*')
          .eq('admin_id', adminId)
          .eq('content_type', contentType)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          // Safely handle logo_url, ensuring it's a string
          const logoUrl = typeof data.layout_settings === 'object' && 
                          data.layout_settings !== null && 
                          'logo_url' in data.layout_settings ? 
                          String(data.layout_settings.logo_url || '') : '';
          
          setPreviewData(prev => ({
            ...prev,
            primary_color: data.primary_color,
            secondary_color: data.secondary_color,
            accent_color: data.accent_color,
            logo_url: logoUrl,
          }));
        }
      } catch (error) {
        console.error("Error loading template settings:", error);
      }
    };
    
    loadTemplateSettings();
  }, [contentType, adminId]);

  const templateVariables = {
    base: [
      { name: "{{title}}", description: "Email subject/title" },
      { name: "{{{header_template}}}", description: "Inserts the header template" },
      { name: "{{{content_cards}}}", description: "Inserts content card templates" },
      { name: "{{{footer_template}}}", description: "Inserts the footer template" },
      { name: "{{recipient_name}}", description: "Recipient's name" },
      { name: "{{intro_text}}", description: "Introductory text" },
      { name: "{{cta_text}}", description: "Call to action text" },
      { name: "{{site_url}}", description: "Website URL" },
    ],
    header: [
      { name: "{{logo_url}}", description: "URL to the logo image" },
      { name: "{{title}}", description: "Email subject/title" },
      { name: "{{primary_color}}", description: "Primary brand color" }
    ],
    content_card: [
      { name: "{{image_url}}", description: "URL to the content image" },
      { name: "{{title}}", description: "Content title" },
      { name: "{{description}}", description: "Content description" },
      { name: "{{detail_url}}", description: "URL to content details" },
      { name: "{{primary_color}}", description: "Primary brand color" },
      { name: "{{secondary_color}}", description: "Secondary brand color" },
      { name: "{{accent_color}}", description: "Accent color for titles/links" },
      { name: "{{metadata}}", description: "Array of metadata strings" }
    ],
    footer: [
      { name: "{{current_year}}", description: "Current year" },
      { name: "{{unsubscribe_url}}", description: "Unsubscribe link URL" }
    ]
  };

  const currentTemplateVars = templateVariables[templateType as keyof typeof templateVariables] || [];

  const renderPreview = () => {
    try {
      // Very basic variable substitution - we're not trying to implement a full template engine here
      let preview = htmlContent;
      
      // Replace variables
      Object.entries(previewData).forEach(([key, value]) => {
        preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value.toString());
      });
      
      // Basic handling of conditionals for demo
      preview = preview.replace(/{{#if ([^}]+)}}([^]*){{\/if}}/g, (match, condition, content) => {
        const conditionKey = condition.trim();
        return previewData[conditionKey as keyof PreviewData] ? content : '';
      });
      
      return preview;
    } catch (error) {
      return `<div style="color: red;">Error rendering preview: ${error}</div>`;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Email HTML Template Editor</h2>
            <p className="text-muted-foreground">
              Customize your email templates by editing the HTML directly.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-1 block">Content Type</label>
              <Select 
                value={contentType} 
                onValueChange={(value) => setContentType(value as ContentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-1 block">Template Type</label>
              <Select 
                value={templateType} 
                onValueChange={setTemplateType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between mb-4">
            <TabsList>
              <TabsTrigger value="editor">HTML Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="variables">Template Variables</TabsTrigger>
            </TabsList>
            
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={resetTemplate}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button 
                onClick={saveTemplate}
                size="sm"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </>
                )}
              </Button>
            </div>
          </div>

          <TabsContent value="editor" className="pt-2">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Editor
                height="500px"
                language="html"
                value={htmlContent}
                onChange={(value) => setHtmlContent(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  folding: true,
                  lineNumbers: "on",
                  automaticLayout: true,
                }}
              />
            )}
          </TabsContent>
          
          <TabsContent value="preview" className="pt-2">
            <div className="bg-gray-100 p-4 rounded border overflow-auto h-[500px]">
              <div dangerouslySetInnerHTML={{ __html: renderPreview() }} />
            </div>
          </TabsContent>
          
          <TabsContent value="variables" className="pt-2">
            <div className="bg-gray-50 p-6 rounded border">
              <h3 className="text-lg font-medium mb-4">
                Available Variables for {TEMPLATE_TYPES.find(t => t.value === templateType)?.label}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTemplateVars.map((variable, idx) => (
                  <div key={idx} className="bg-white p-4 rounded border">
                    <code className="text-sm font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {variable.name}
                    </code>
                    <p className="mt-1 text-sm text-gray-600">{variable.description}</p>
                  </div>
                ))}
              </div>
              
              {currentTemplateVars.length === 0 && (
                <p className="text-muted-foreground">No variables available for this template type.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
