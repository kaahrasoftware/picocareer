
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Calendar,
  SlidersHorizontal,
  Grid3X3,
  List
} from 'lucide-react';
import { EventCard } from './EventCard';
import { EventEditDialog } from './EventEditDialog';
import { useEventManagement, EnhancedEvent } from '@/hooks/useEventManagement';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { StandardPagination } from '@/components/common/StandardPagination';

interface EventManagementGridProps {
  onViewDetails?: (event: EnhancedEvent) => void;
  onManageResources?: (event: EnhancedEvent) => void;
}

const EVENTS_PER_PAGE = 12;

export function EventManagementGrid({
  onViewDetails,
  onManageResources,
}: EventManagementGridProps) {
  const {
    events,
    isLoading,
    updateEvent,
    deleteEvent,
    bulkDelete,
    updateStatus,
    isUpdating,
    isDeleting,
    isBulkDeleting,
    isUpdatingStatus,
  } = useEventManagement();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [editingEvent, setEditingEvent] = useState<EnhancedEvent | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search logic
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.organized_by && event.organized_by.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || event.status.toLowerCase() === statusFilter.toLowerCase();
      
      const matchesType = typeFilter === 'all' || event.event_type.toLowerCase() === typeFilter.toLowerCase();
      
      const now = new Date();
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      
      let matchesDate = true;
      if (dateFilter === 'upcoming') {
        matchesDate = eventStart > now;
      } else if (dateFilter === 'past') {
        matchesDate = eventEnd < now;
      } else if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        matchesDate = eventStart >= today && eventStart < tomorrow;
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [events, searchQuery, statusFilter, typeFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, dateFilter]);

  const handleSelectEvent = (eventId: string, selected: boolean) => {
    const newSelected = new Set(selectedEvents);
    if (selected) {
      newSelected.add(eventId);
    } else {
      newSelected.delete(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(new Set(paginatedEvents.map(event => event.id)));
    } else {
      setSelectedEvents(new Set());
    }
  };

  const handleBulkDelete = () => {
    bulkDelete(Array.from(selectedEvents));
    setSelectedEvents(new Set());
    setShowBulkDeleteDialog(false);
  };

  const handleStatusUpdate = (status: string) => {
    updateStatus({
      eventIds: Array.from(selectedEvents),
      status: status,
    });
    setSelectedEvents(new Set());
  };

  const allSelected = paginatedEvents.length > 0 && paginatedEvents.every(event => selectedEvents.has(event.id));
  const someSelected = selectedEvents.size > 0;

  // Get unique values for filters
  const uniqueStatuses = Array.from(new Set(events.map(event => event.status)));
  const uniqueTypes = Array.from(new Set(events.map(event => event.event_type)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Management
              <Badge variant="secondary" className="ml-2">
                {filteredEvents.length} of {events.length}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status.toLowerCase()}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {someSelected && (
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                indeterminate={someSelected && !allSelected}
              />
              <span className="text-sm font-medium">
                {selectedEvents.size} event{selectedEvents.size !== 1 ? 's' : ''} selected
              </span>
              
              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate('Approved')}
                  disabled={isUpdatingStatus}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate('Rejected')}
                  disabled={isUpdatingStatus}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowBulkDeleteDialog(true)}
                  disabled={isBulkDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
          
          {/* Pagination Info */}
          {filteredEvents.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
              <span>
                Showing {startIndex + 1}-{Math.min(startIndex + EVENTS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length} events
              </span>
              <span>
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Events Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Events Found
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first event to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {paginatedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isSelected={selectedEvents.has(event.id)}
                onSelect={handleSelectEvent}
                onEdit={setEditingEvent}
                onDelete={deleteEvent}
                onViewDetails={onViewDetails}
                onManageResources={onManageResources}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <StandardPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showPageNumbers={true}
              maxPageButtons={5}
            />
          )}
        </>
      )}

      {/* Edit Dialog */}
      <EventEditDialog
        event={editingEvent}
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSave={(data) => {
          updateEvent(data);
          setEditingEvent(null);
        }}
        isLoading={isUpdating}
      />

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Events</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedEvents.size} event{selectedEvents.size !== 1 ? 's' : ''}? 
              This action cannot be undone and will also delete all associated resources and registrations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
              Delete Events
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
