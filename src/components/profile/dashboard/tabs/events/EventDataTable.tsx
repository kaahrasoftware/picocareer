
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Settings } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { Loader2 } from 'lucide-react';

interface EventDataTableProps {
  onViewDetails: (event: any) => void;
  onEventSelect?: (event: any) => void;
}

export function EventDataTable({ onViewDetails, onEventSelect }: EventDataTableProps) {
  const { events, isLoading, registrationCounts } = useEvents();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading events...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Events List</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left">Event Title</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Date</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Location</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Attendees</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                  No events found
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">{event.title}</td>
                  <td className="border border-gray-200 px-4 py-2">
                    {new Date(event.start_time).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {event.location || 'Virtual'}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      event.status === 'Approved' 
                        ? 'bg-blue-100 text-blue-800' 
                        : event.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {registrationCounts[event.id] || 0}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(event)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {onEventSelect && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEventSelect(event)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Manage Resources
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
