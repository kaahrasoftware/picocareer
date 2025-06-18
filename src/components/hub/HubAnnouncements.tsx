
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HubAnnouncement } from "@/types/database/hubs";
import { AnnouncementForm } from "./forms/AnnouncementForm";
import { AnnouncementFilters } from "./announcements/AnnouncementFilters";
import { AnnouncementGrid } from "./announcements/AnnouncementGrid";
import { useAnnouncements } from "./announcements/useAnnouncements";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HubAnnouncementsProps {
  hubId: string;
  isAdmin?: boolean;
  isModerator?: boolean;
}

const categoryColors: Record<string, string> = {
  event: "bg-[#F2FCE2] hover:bg-[#F2FCE2]/90 border-green-200",
  news: "bg-[#FEF7CD] hover:bg-[#FEF7CD]/90 border-yellow-200",
  alert: "bg-[#FFDEE2] hover:bg-[#FFDEE2]/90 border-pink-200",
  general: "bg-[#D3E4FD] hover:bg-[#D3E4FD]/90 border-blue-200"
};

export function HubAnnouncements({
  hubId,
  isAdmin = false,
  isModerator = false
}: HubAnnouncementsProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortByRecent, setSortByRecent] = useState(true);
  const [editingAnnouncement, setEditingAnnouncement] = useState<HubAnnouncement | null>(null);
  const { toast } = useToast();
  const canManage = isAdmin || isModerator;

  const { data: announcements, isLoading, refetch } = useAnnouncements(hubId, sortByRecent);

  const handleEdit = (announcement: HubAnnouncement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const handleDelete = async (announcementId: string) => {
    try {
      const { error } = await supabase
        .from('hub_announcements')
        .delete()
        .eq('id', announcementId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement deleted successfully"
      });

      refetch();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
  };

  const getCardColor = (category: string) => {
    return categoryColors[category] || "bg-card hover:bg-card/90";
  };

  if (isLoading) {
    return <div>Loading announcements...</div>;
  }

  const filteredAnnouncements = announcements?.filter(
    announcement => selectedCategory === "all" || announcement.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Announcements</h2>
        {canManage && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Announcement
          </Button>
        )}
      </div>

      <AnnouncementFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onSortToggle={() => setSortByRecent(!sortByRecent)}
        categoryColors={categoryColors}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
            </DialogTitle>
          </DialogHeader>
          <AnnouncementForm 
            hubId={hubId} 
            onSuccess={() => {
              handleFormClose();
              refetch();
            }} 
            onCancel={handleFormClose}
            existingAnnouncement={editingAnnouncement || undefined}
          />
        </DialogContent>
      </Dialog>

      {filteredAnnouncements && (
        <AnnouncementGrid
          announcements={filteredAnnouncements}
          getCardColor={getCardColor}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={canManage}
        />
      )}
    </div>
  );
}
