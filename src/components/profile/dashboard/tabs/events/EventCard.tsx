
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Trash2, 
  Edit, 
  Eye,
  Clock,
  MapPin,
  User,
  MoreHorizontal
} from 'lucide-react';
import { EnhancedEvent } from '@/hooks/useEventManagement';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EventCardProps {
  event: EnhancedEvent;
  isSelected?: boolean;
  onSelect?: (eventId: string, selected: boolean) => void;
  onEdit?: (event: EnhancedEvent) => void;
  onDelete?: (eventId: string) => void;
  onViewDetails?: (event: EnhancedEvent) => void;
  onManageResources?: (event: EnhancedEvent) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getEventTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'webinar':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'workshop':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'conference':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'seminar':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function EventCard({
  event,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onViewDetails,
  onManageResources,
}: EventCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSelectChange = (checked: boolean) => {
    onSelect?.(event.id, checked);
  };

  const handleDelete = () => {
    onDelete?.(event.id);
    setShowDeleteDialog(false);
  };

  const isPastEvent = new Date(event.end_time) < new Date();

  return (
    <>
      <Card className={`group hover:shadow-lg transition-all duration-200 border ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'border-gray-200'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {onSelect && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleSelectChange}
                  className="mt-1 flex-shrink-0"
                />
              )}
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={getEventTypeColor(event.event_type)}>
                    {event.event_type}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                  {isPastEvent && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      Past Event
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 mb-2">
                  {event.title}
                </h3>
                
                {event.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {event.description.replace(/<[^>]*>/g, '')}
                  </p>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onViewDetails?.(event)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(event)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManageResources?.(event)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Resources
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Event Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">
                {format(new Date(event.start_time), 'MMM d, yyyy')}
              </span>
              <Clock className="h-4 w-4 ml-2 flex-shrink-0" />
              <span>
                {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{event.platform}</span>
            </div>
            
            {(event.organized_by || event.facilitator) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4 flex-shrink-0" />
                <span>{event.organized_by || event.facilitator}</span>
              </div>
            )}
          </div>
          
          {/* Metrics */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{event.registrations_count}</span>
              <span className="text-gray-500">registrations</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="font-medium">{event.resources_count}</span>
              <span className="text-gray-500">resources</span>
            </div>
            
            {event.max_attendees && (
              <div className="text-sm text-gray-500">
                Max: {event.max_attendees}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails?.(event)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit?.(event)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onManageResources?.(event)}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Resources
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone and will also delete all associated resources and registrations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
