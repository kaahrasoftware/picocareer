
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { FormData } from "../HubGeneralSettings";
import { UseFormRegister } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ImportantLinksSectionProps {
  register: UseFormRegister<FormData>;
  hubId: string;
  defaultValues: { title: string; url: string; }[];
}

export function ImportantLinksSection({ register, hubId, defaultValues }: ImportantLinksSectionProps) {
  const [links, setLinks] = useState(defaultValues || []);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddLink = () => {
    setLinks([...links, { title: '', url: '' }]);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    setLinks(newLinks);
  };

  const handleLinkChange = (index: number, field: 'title' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('hubs')
        .update({ important_links: links })
        .eq('id', hubId);

      if (error) throw error;

      // Log the audit event
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: hubId,
        _action: 'hub_settings_updated',
        _details: JSON.stringify({ important_links: links })
      });

      await queryClient.invalidateQueries({ queryKey: ['hub', hubId] });

      toast({
        title: "Links updated",
        description: "Important links have been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating links:', error);
      toast({
        title: "Error",
        description: "Failed to update links. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Important Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {links.map((link, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Link Title"
                value={link.title}
                onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
              />
              <Input
                placeholder="URL (https://...)"
                value={link.url}
                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
              />
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleRemoveLink(index)}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddLink}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Link
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save All"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
