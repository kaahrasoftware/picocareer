import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MentorDetailsDialog } from "./MentorDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, Users, Star } from "lucide-react";

interface MentorCardProps {
  title: string;
  company: string;
  imageUrl: string;
  name: string;
  stats: {
    mentees: string;
    connected: string;
    recordings: string;
  };
  username: string;
}

export function MentorCard(props: MentorCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card 
        className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 bg-card border p-4"
        onClick={() => setDialogOpen(true)}
      >
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">{props.title}</h3>
            <p className="text-sm text-muted-foreground">{props.company}</p>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{props.stats.mentees}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} />
                <span>{props.stats.connected}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen size={14} />
                <span>{props.stats.recordings}</span>
              </div>
            </div>
            <Avatar className="h-12 w-12">
              <AvatarImage src={props.imageUrl} alt={props.name} />
              <AvatarFallback>{props.name[0]}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex justify-between items-center mt-auto">
            <div>
              <p className="text-sm font-medium">{props.name}</p>
              <p className="text-xs text-muted-foreground">@{props.username}</p>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
              mentor
            </Badge>
          </div>
        </div>
      </Card>
      <MentorDetailsDialog 
        mentor={props}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}