
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileEditForm } from "@/components/profile-details/ProfileEditForm";
import { Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface UserProfileDetailsDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDetailsDialog({ userId, open, onOpenChange }: UserProfileDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset editing state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['profile-admin-edit', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          companies:company_id(name),
          schools:school_id(name),
          majors:academic_major_id(title),
          careers:position(title)
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      // Transform data to match expected ProfileFormProps structure
      return {
        ...data,
        company_name: data?.companies?.name,
        school_name: data?.schools?.name,
        academic_major: data?.majors?.title,
        career_title: data?.careers?.title
      };
    },
    enabled: !!userId && open,
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-users'] });
    queryClient.invalidateQueries({ queryKey: ['profile-admin-edit', userId] });
    toast({
      title: "Success",
      description: "User profile updated successfully",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl min-h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </DialogContent>
      </Dialog>
    );
  }

  if (isError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTitle>Failed to load user profile</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "An unknown error occurred."}
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Not Found</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertTitle>User profile not found</AlertTitle>
            <AlertDescription>
              The requested user profile could not be found.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{profile.full_name || profile.email}</span>
            <Button 
              onClick={() => setIsEditing(!isEditing)} 
              variant={isEditing ? "destructive" : "default"}
              size="sm"
            >
              {isEditing ? "Cancel Editing" : "Edit User"}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            {isEditing ? (
              <ProfileEditForm 
                profile={profile} 
                onCancel={() => setIsEditing(false)}
                onSuccess={handleSuccess}
              />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p>{profile.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">User Type</h3>
                    <p className="capitalize">{profile.user_type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                    <p>{profile.first_name} {profile.last_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Onboarding Status</h3>
                    <p>{profile.onboarding_status}</p>
                  </div>
                </div>

                {profile.bio && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Bio</h3>
                    <p className="text-sm">{profile.bio}</p>
                  </div>
                )}

                {profile.user_type === 'mentor' && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Years of Experience</h3>
                      <p>{profile.years_of_experience}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Total Sessions</h3>
                      <p>{profile.total_booked_sessions}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Position</h3>
                      <p>{profile.career_title || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Company</h3>
                      <p>{profile.company_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Academic Major</h3>
                      <p>{profile.academic_major || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">School</h3>
                      <p>{profile.school_name || 'Not specified'}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="activity">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-muted-foreground">User activity data will be available soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
