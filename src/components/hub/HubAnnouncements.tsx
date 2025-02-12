
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnnouncementForm } from "./forms/AnnouncementForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { HubAnnouncement } from "@/types/database/hubs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface HubAnnouncementsProps {
  hubId: string;
}

export function HubAnnouncements({ hubId }: HubAnnouncementsProps) {
  const [showForm, setShowForm] = useState(false);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['hub-announcements', hubId],
    queryFn: async () => {
      // First fetch announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('hub_announcements')
        .select('*')
        .eq('hub_id', hubId)
        .order('created_at', { ascending: false });

      if (announcementsError) throw announcementsError;

      // Then fetch creator profiles separately
      const creatorIds = announcementsData.map(a => a.created_by).filter(Boolean);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', creatorIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const profileMap = new Map(profilesData?.map(p => [p.id, p]));
      
      return announcementsData.map(announcement => ({
        ...announcement,
        created_by_profile: profileMap.get(announcement.created_by) || null
      }));
    },
  });

  if (isLoading) {
    return <div>Loading announcements...</div>;
  }

  // Calculate the number of slides needed (4 cards per slide)
  const itemsPerSlide = 4;
  const slides = announcements ? Math.ceil(announcements.length / itemsPerSlide) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Announcements</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Announcement
        </Button>
      </div>

      {showForm && (
        <AnnouncementForm 
          hubId={hubId} 
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {announcements && announcements.length > 0 && (
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {Array.from({ length: slides }).map((_, slideIndex) => (
              <CarouselItem key={slideIndex} className="pl-4 basis-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {announcements
                    .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                    .map((announcement) => (
                      <Card key={announcement.id}>
                        <CardHeader>
                          <CardTitle>{announcement.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="whitespace-pre-wrap line-clamp-3">{announcement.content}</p>
                          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                            <time>
                              {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                            </time>
                            {announcement.created_by_profile && (
                              <p>
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
      )}
    </div>
  );
}
