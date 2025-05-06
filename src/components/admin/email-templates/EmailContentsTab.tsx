
import React, { useState } from "react";
import { EmailHtmlEditor } from "./EmailHtmlEditor";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CONTENT_TYPE_LABELS, ContentType } from "../email-campaign-form/utils";
import { EmailTemplateEditor } from "./EmailTemplateEditor";

interface EmailContentsTabProps {
  adminId: string;
}

export function EmailContentsTab({ adminId }: EmailContentsTabProps) {
  const [activeTab, setActiveTab] = useState<ContentType>("blogs");
  const contentTypes = Object.keys(CONTENT_TYPE_LABELS) as ContentType[];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">Email Content Templates</h2>
        <p className="text-gray-500 mb-6">
          Customize the content of your email templates. Changes will be applied to all future emails of the selected content type.
        </p>
        
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as ContentType)} 
          className="space-y-6"
        >
          <TabsList className="bg-muted inline-flex h-auto p-1 mb-4 flex-wrap">
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

          {contentTypes.map((type) => (
            <TabsContent key={type} value={type}>
              <EmailTemplateEditor 
                adminId={adminId}
                contentType={type}
              />
            </TabsContent>
          ))}
        </Tabs>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">Email HTML Templates</h2>
        <p className="text-gray-500 mb-6">
          Customize the HTML structure of your email templates. Changes will be applied to all future emails of the selected content type.
        </p>
        
        <EmailHtmlEditor adminId={adminId} />
      </Card>
    </div>
  );
}
