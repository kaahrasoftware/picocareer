
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContentTypeTemplateEditor } from "./ContentTypeTemplateEditor";
import { TemplateSettingsForm } from "./TemplateSettingsForm";
import { CONTENT_TYPE_LABELS, ContentType } from "../email-campaign-form/utils";
import { useState } from "react";
import { Card } from "@/components/ui/card";

interface TemplateSettingsTabProps {
  adminId: string;
}

export function TemplateSettingsTab({ adminId }: TemplateSettingsTabProps) {
  const contentTypes = Object.keys(CONTENT_TYPE_LABELS) as ContentType[];
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">Email Template Settings</h2>
        <p className="text-gray-500 mb-6">
          Configure how your emails look and feel. Set global defaults and customize templates for each content type.
        </p>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-6"
        >
          <TabsList className="bg-muted inline-flex h-auto p-1 mb-4 flex-wrap">
            <TabsTrigger 
              value="general"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              General Settings
            </TabsTrigger>
            {contentTypes.map((type) => (
              <TabsTrigger 
                key={type} 
                value={type}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {CONTENT_TYPE_LABELS[type]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="general">
            <TemplateSettingsForm adminId={adminId} />
          </TabsContent>

          {contentTypes.map((type) => (
            <TabsContent key={type} value={type}>
              <ContentTypeTemplateEditor 
                adminId={adminId}
                contentType={type}
              />
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}
