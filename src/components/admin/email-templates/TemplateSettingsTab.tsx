
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContentTypeTemplateEditor } from "./ContentTypeTemplateEditor";
import { TemplateSettingsForm } from "./TemplateSettingsForm";
import { CONTENT_TYPE_LABELS, ContentType } from "../email-campaign-form/utils";

interface TemplateSettingsTabProps {
  adminId: string;
}

export function TemplateSettingsTab({ adminId }: TemplateSettingsTabProps) {
  const contentTypes = Object.keys(CONTENT_TYPE_LABELS) as ContentType[];

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList>
        <TabsTrigger value="general">General Settings</TabsTrigger>
        {contentTypes.map((type) => (
          <TabsTrigger key={type} value={type}>
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
  );
}
