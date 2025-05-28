
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Simplified SessionType interface to match expected database structure
interface SessionType {
  id?: string;
  mentor_id: string;
  session_type: string;
  custom_type_name?: string;
  description?: string;
  duration: number;
  meeting_platform: string[]; // Changed from union array to string array
  phone_number?: string;
  price_in_tokens: number;
  is_active: boolean;
  max_sessions_per_day?: number;
  requires_approval?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function MentorTab() {
  const [sessionTypes, setSessionTypes] = React.useState<SessionType[]>([]);
  const [showAddDialog, setShowAddDialog] = React.useState(false);

  const handleAddSessionType = async (newSessionType: Omit<SessionType, "id" | "created_at" | "updated_at"> & { id?: string }) => {
    try {
      console.log('Adding session type:', newSessionType);
      
      // For now, just add to local state
      const sessionTypeWithId = {
        ...newSessionType,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setSessionTypes(prev => [...prev, sessionTypeWithId]);
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding session type:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Mentor Dashboard</h3>
          <p className="text-muted-foreground">Manage your mentoring sessions and availability</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Session Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Session Type</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-muted-foreground">
              Session type creation form would go here
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Session Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionTypes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No session types configured yet</p>
                <p className="text-sm">Add your first session type to start accepting bookings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessionTypes.map((sessionType) => (
                  <div key={sessionType.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{sessionType.custom_type_name || sessionType.session_type}</h4>
                      <Badge variant={sessionType.is_active ? "default" : "secondary"}>
                        {sessionType.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{sessionType.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {sessionType.duration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        {sessionType.meeting_platform.join(", ")}
                      </div>
                      <Badge variant="outline">
                        {sessionType.price_in_tokens} tokens
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
