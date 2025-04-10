
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { useDisclosure } from "@/hooks/useDisclosure";
import { format } from "date-fns";

interface EmptyStateDisplayProps {
  date?: Date;
  showAddButton?: boolean;
  onAddClick?: () => void;
}

export function EmptyStateDisplay({ 
  date, 
  showAddButton = false,
  onAddClick 
}: EmptyStateDisplayProps) {
  const { onOpen } = useDisclosure();
  
  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      onOpen();
    }
  };

  // Generate message based on whether date is provided
  let message = "No events scheduled";
  
  if (date && !isNaN(date.getTime())) {
    message = `No events scheduled for ${format(date, "MMMM d, yyyy")}`;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="flex flex-col items-center space-y-2">
        <CalendarPlus className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">{message}</h3>
        <p className="text-sm text-muted-foreground">
          {showAddButton
            ? "Add availability or schedule a session"
            : "Check back later or select another date"}
        </p>
        
        {showAddButton && (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleAddClick}
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            Add Availability
          </Button>
        )}
      </div>
    </div>
  );
}
