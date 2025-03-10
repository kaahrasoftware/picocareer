
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResourceForm } from "./forms/ResourceForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { HubResource } from "@/types/database/hubs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResourceCard } from "./resources/ResourceCard";
import { ResourceFilters } from "./resources/ResourceFilters";
import { ResourcePagination } from "./resources/ResourcePagination";

interface HubResourcesProps {
  hubId: string;
  isAdmin?: boolean;
}

export function HubResources({ hubId, isAdmin }: HubResourcesProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const resourcesPerPage = 12;

  const { data: resources, isLoading, refetch } = useQuery({
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

  const totalPages = Math.ceil((filteredResources?.length || 0) / resourcesPerPage);
  const startIndex = (currentPage - 1) * resourcesPerPage;
  const endIndex = startIndex + resourcesPerPage;
  const currentResources = filteredResources?.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : value);
    setCurrentPage(1);
  };

  const handleResourceDeleted = () => {
    refetch();
  };

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
              onSuccess={() => {
                setShowForm(false);
                refetch();
              }}
              onCancel={() => setShowForm(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <ResourceFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        categories={categories}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentResources?.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onClick={() => window.open(getResourceUrl(resource), '_blank')}
            isAdmin={isAdmin}
            onDeleted={handleResourceDeleted}
          />
        ))}
        {(!currentResources || currentResources.length === 0) && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No resources found
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <ResourcePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
