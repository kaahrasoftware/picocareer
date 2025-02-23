
import { HubAnnouncement } from "@/types/database/hubs";
import { AnnouncementCard } from "./AnnouncementCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface AnnouncementGridProps {
  announcements: HubAnnouncement[];
  getCardColor: (category: string) => string;
  onEdit: (announcement: HubAnnouncement) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export function AnnouncementGrid({
  announcements,
  getCardColor,
  onEdit,
  onDelete,
  isAdmin
}: AnnouncementGridProps) {
  const itemsPerSlide = 4;
  const slides = Math.ceil(announcements.length / itemsPerSlide);

  if (announcements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No announcements found
      </div>
    );
  }

  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent className="-ml-4">
        {Array.from({ length: slides }).map((_, slideIndex) => (
          <CarouselItem key={slideIndex} className="pl-4 basis-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {announcements
                .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                .map(announcement => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    categoryColor={getCardColor(announcement.category)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isAdmin={isAdmin}
                  />
                ))}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
