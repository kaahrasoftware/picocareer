
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventTypeTagProps {
  eventType?: string;
  className?: string;
}

export function EventTypeTag({ eventType, className }: EventTypeTagProps) {
  if (!eventType) return null;
  
  // Define color mapping for different event types
  const getEventTypeStyles = () => {
    const type = eventType.toLowerCase();
    
    if (type.includes('workshop')) {
      return "bg-green-100 hover:bg-green-200 text-green-800 border-green-300";
    } else if (type.includes('webinar')) {
      return "bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300";
    } else if (type.includes('conference')) {
      return "bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300";
    } else if (type.includes('training')) {
      return "bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300";
    } else if (type.includes('seminar')) {
      return "bg-teal-100 hover:bg-teal-200 text-teal-800 border-teal-300";
    } else if (type.includes('panel')) {
      return "bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-300";
    } else if (type.includes('coffee')) {
      return "bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300";
    } else if (type.includes('meetup')) {
      return "bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-300";
    }
    
    // Default style
    return "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300";
  };

  return (
    <Badge 
      className={cn(
        "text-xs font-medium px-2 py-1 border", 
        getEventTypeStyles(),
        className
      )}
    >
      <Tag className="h-3 w-3 mr-1" />
      {eventType}
    </Badge>
  );
}
