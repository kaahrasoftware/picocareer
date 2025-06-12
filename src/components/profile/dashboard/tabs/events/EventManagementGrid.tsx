
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CalendarDays, Users, FileText, MoreHorizontal, Trash2, Edit, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
  event_type: string;
  max_attendees?: number;
  registrations?: { count: number }[];
}

interface EventManagementGridProps {
  events: Event[];
  selectedEvents: string[];
  onEventSelect: (eventId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onBulkDelete: () => void;
  onEditEvent: (event: Event) => void;
  onViewDetails: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  isDeleting?: boolean;
}

export function EventManagementGrid({
  events,
  selectedEvents,
  onEventSelect,
  onSelectAll,
  onBulkDelete,
  onEditEvent,
  onViewDetails,
  onDeleteEvent,
  isDeleting = false
}: EventManagementGridProps) {
  const allSelected = events.length > 0 && selectedEvents.length === events.length;
  const someSelected = selectedEvents.length > 0 && selectedEvents.length < events.length;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'webinar':
        return 'bg-blue-100 text-blue-800';
      case 'workshop':
        return 'bg-purple-100 text-purple-800';
      case 'networking':
        return 'bg-green-100 text-green-800';
      case 'conference':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={allSelected}
            onChange={(checked) => onSelectAll(checked as boolean)}
            ref={(el) => {
              if (el) {
                el.indeterminate = someSelected;
              }
            }}
          />
          <span className="text-sm text-muted-foreground">
            {selectedEvents.length > 0 
              ? `${selectedEvents.length} selected`
              : `${events.length} events`
            }
          </span>
        </div>
        
        {selectedEvents.length > 0 && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onBulkDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedEvents.length})
          </Button>
        )}
      </div>

      {/* Events grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="relative">
            <div className="absolute top-4 left-4">
              <Checkbox
                checked={selectedEvents.includes(event.id)}
                onChange={(checked) => onEventSelect(event.id, checked as boolean)}
              />
            </div>
            
            <CardHeader className="pl-12 pr-12">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-base line-clamp-2">{event.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                    <Badge className={getTypeColor(event.event_type)}>
                      {event.event_type}
                    </Badge>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(event)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditEvent(event)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteEvent(event.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <CardDescription className="line-clamp-2">
                {event.description}
              </CardDescription>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {format(new Date(event.start_time), 'MMM d, yyyy • h:mm a')}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {event.registrations?.[0]?.count || 0} registered
                    {event.max_attendees && ` / ${event.max_attendees}`}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(event)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-8">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <p className="text-muted-foreground">Create your first event to get started.</p>
        </div>
      )}
    </div>
  );
}
