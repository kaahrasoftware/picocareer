
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Settings } from 'lucide-react';

interface EventDataTableProps {
  onViewDetails: (event: any) => void;
  onEventSelect?: (event: any) => void;
}

export function EventDataTable({ onViewDetails, onEventSelect }: EventDataTableProps) {
  // Mock data for demonstration - replace with actual data fetching
  const mockEvents = [
    {
      id: '1',
      title: 'Career Fair 2024',
      date: '2024-06-15',
      location: 'Main Campus',
      status: 'upcoming',
      attendees: 150
    },
    {
      id: '2', 
      title: 'Tech Workshop',
      date: '2024-06-20',
      location: 'Virtual',
      status: 'upcoming',
      attendees: 75
    },
    {
      id: '3',
      title: 'Alumni Networking',
      date: '2024-05-10',
      location: 'Downtown Hall',
      status: 'completed',
      attendees: 200
    }
  ];

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
            {mockEvents.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">{event.title}</td>
                <td className="border border-gray-200 px-4 py-2">{event.date}</td>
                <td className="border border-gray-200 px-4 py-2">{event.location}</td>
                <td className="border border-gray-200 px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    event.status === 'upcoming' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {event.status}
                  </span>
                </td>
                <td className="border border-gray-200 px-4 py-2">{event.attendees}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
