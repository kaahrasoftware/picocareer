
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnnouncementForm } from "./forms/AnnouncementForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Plus, SortDesc, Pencil, Trash2 } from "lucide-react";
import { HubAnnouncement } from "@/types/database/hubs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface HubAnnouncementsProps {
  hubId: string;
}

export function HubAnnouncements({
  hubId
}: HubAnnouncementsProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortByRecent, setSortByRecent] = useState(true);
  const [editingAnnouncement, setEditingAnnouncement] = useState<HubAnnouncement | null>(null);
  const { toast } = useToast();

  const {
    data: announcements,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['hub-announcements', hubId],
    queryFn: async () => {
      // First fetch announcements
      const {
        data: announcementsData,
        error: announcementsError
      } = await supabase.from('hub_announcements').select('*').eq('hub_id', hubId).order('created_at', {
        ascending: !sortByRecent
      });
      if (announcementsError) throw announcementsError;

      // Then fetch creator profiles separately
      const creatorIds = announcementsData.map(a => a.created_by).filter(Boolean);
      const {
        data: profilesData,
        error: profilesError
      } = await supabase.from('profiles').select('id, first_name, last_name').in('id', creatorIds);
      if (profilesError) throw profilesError;

      // Combine the data
      const profileMap = new Map(profilesData?.map(p => [p.id, p]));
      return announcementsData.map(announcement => ({
        ...announcement,
        created_by_profile: profileMap.get(announcement.created_by) || null
      }));
    }
  });

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

  if (isLoading) {
    return <div>Loading announcements...</div>;
  }

  const filteredAnnouncements = announcements?.filter(announcement => selectedCategory === "all" || announcement.category === selectedCategory);

  // Get unique categories from announcements
  const categories = [...new Set(announcements?.map(a => a.category).filter(Boolean))];

  // Calculate the number of slides needed (4 cards per slide)
  const itemsPerSlide = 4;
  const slides = filteredAnnouncements ? Math.ceil(filteredAnnouncements.length / itemsPerSlide) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Announcements</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Announcement
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={() => setSortByRecent(!sortByRecent)}>
          <SortDesc className="h-4 w-4" />
        </Button>
      </div>

      {showForm && (
        <AnnouncementForm 
          hubId={hubId} 
          onSuccess={() => {
            handleFormClose();
            refetch();
          }} 
          onCancel={handleFormClose}
          existingAnnouncement={editingAnnouncement || undefined}
        />
      )}

      {filteredAnnouncements && filteredAnnouncements.length > 0 ? (
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent className="-ml-4">
            {Array.from({ length: slides }).map((_, slideIndex) => (
              <CarouselItem key={slideIndex} className="pl-4 basis-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredAnnouncements
                    .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                    .map(announcement => (
                      <Card key={announcement.id}>
                        <CardHeader className="relative">
                          <CardTitle className="text-base font-semibold">
                            {announcement.title}
                          </CardTitle>
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(announcement)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the announcement.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(announcement.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="whitespace-pre-wrap line-clamp-3 text-sm font-normal text-gray-600">{announcement.content}</p>
                          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                            {announcement.category && (
                              <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">
                                {announcement.category}
                              </span>
                            )}
                            <time>
                              {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                            </time>
                            {announcement.created_by_profile && (
                              <p className="text-cyan-500">
                                Posted by: {announcement.created_by_profile.first_name} {announcement.created_by_profile.last_name}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No announcements found
        </div>
      )}
    </div>
  );
}
