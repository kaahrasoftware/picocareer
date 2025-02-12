
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResourceForm } from "./forms/ResourceForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { FileText, Plus, Image, Video, Music, Link2, File } from "lucide-react";
import { HubResource } from "@/types/database/hubs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HubResourcesProps {
  hubId: string;
}

const getResourceIcon = (resource: HubResource) => {
  switch (resource.resource_type) {
    case 'document':
      return <FileText className="h-5 w-5" />;
    case 'image':
      return <Image className="h-5 w-5" />;
    case 'video':
      return <Video className="h-5 w-5" />;
    case 'audio':
      return <Music className="h-5 w-5" />;
    case 'external_link':
      return <Link2 className="h-5 w-5" />;
    default:
      return <File className="h-5 w-5" />;
  }
};

export function HubResources({ hubId }: HubResourcesProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const resourcesPerPage = 100;

  const { data: resources, isLoading } = useQuery({
    queryKey: ['hub-resources', hubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_resources')
        .select(`
          *,
          created_by_profile:created_by(
            first_name,
            last_name
          )
        `)
        .eq('hub_id', hubId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading resources...</div>;
  }

  const getResourceUrl = (resource: HubResource) => {
    return resource.resource_type === 'external_link' ? resource.external_url : resource.file_url;
  };

  const categories = Array.from(new Set(resources?.map(r => r.category).filter(Boolean) || []));

  const filteredResources = resources?.filter(resource => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || resource.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate pagination
  const totalPages = Math.ceil((filteredResources?.length || 0) / resourcesPerPage);
  const startIndex = (currentPage - 1) * resourcesPerPage;
  const endIndex = startIndex + resourcesPerPage;
  const currentResources = filteredResources?.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Resources</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <ScrollArea className="h-full max-h-[80vh] pr-4">
            <ResourceForm 
              hubId={hubId} 
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search resources by title or description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full"
          />
        </div>
        <Select
          value={selectedCategory || "all"}
          onValueChange={(value) => {
            setSelectedCategory(value === "all" ? null : value);
            setCurrentPage(1); // Reset to first page on category change
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[500px] rounded-md border p-4">
        <div className="flex flex-col space-y-4">
          {currentResources?.map((resource) => (
            <Card 
              key={resource.id}
              className="transition-colors hover:bg-accent cursor-pointer"
              onClick={() => window.open(getResourceUrl(resource), '_blank')}
            >
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  {getResourceIcon(resource)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {resource.description}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {resource.category && (
                    <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs mb-2">
                      {resource.category}
                    </span>
                  )}
                  <div className="flex flex-col items-end gap-1">
                    <time>
                      {format(new Date(resource.created_at), 'MMM d, yyyy')}
                    </time>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
          {(!currentResources || currentResources.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No resources found
            </div>
          )}
        </div>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
