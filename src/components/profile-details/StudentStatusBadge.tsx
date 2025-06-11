
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Edit3, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudentStatusBadgeProps {
  status: string | null | undefined;
  profileId: string;
  isOwnProfile: boolean;
}

export function StudentStatusBadge({ status, profileId, isOwnProfile }: StudentStatusBadgeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(status || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!selectedStatus) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ student_nonstudent: selectedStatus })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student status updated successfully",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update student status:', error);
      toast({
        title: "Error",
        description: "Failed to update student status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatus(status || '');
    setIsEditing(false);
  };

  const getStatusDisplay = (status: string | null | undefined) => {
    if (!status) return 'Not Set';
    return status === 'Student' ? 'Student' : 'Non-Student';
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    return status === 'Student' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (!isOwnProfile) {
    // Read-only view for other users
    if (!status) return null;
    
    return (
      <Badge variant="secondary" className={getStatusColor(status)}>
        {getStatusDisplay(status)}
      </Badge>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Student">Student</SelectItem>
            <SelectItem value="Non-Student">Non-Student</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isLoading || !selectedStatus}
          className="h-6 w-6 p-0"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Badge variant="secondary" className={getStatusColor(status)}>
        {getStatusDisplay(status)}
      </Badge>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
      >
        <Edit3 className="h-3 w-3" />
      </Button>
    </div>
  );
}
