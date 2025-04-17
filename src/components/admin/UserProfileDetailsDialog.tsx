import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileEditForm } from "@/components/profile-details/ProfileEditForm";
import { Loader2, UserCircle, Settings, UserPlus, Activity } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { MentorSettingsTab } from "./MentorSettingsTab";

type ExtendedProfile = {
  id: string;
  user_type: 'admin' | 'mentor' | 'mentee';
  full_name?: string; 
  email: string;
  first_name?: string;
  last_name?: string;
  location?: string;
  onboarding_status?: string;
  bio?: string;
  years_of_experience?: number;
  total_booked_sessions?: number;
  skills?: string[];
  tools_used?: string[];
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  highest_degree?: string;
  avatar_url?: string;
  [key: string]: any;
};

interface UserProfileDetailsDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDetailsDialog({ userId, open, onOpenChange }: UserProfileDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

      if (!data) return null;

      const profileData: ExtendedProfile = {
        ...data,
        company_name: data.companies?.name,
        school_name: data.schools?.name,
        academic_major: data.majors?.title,
        career_title: data.careers?.title,
        user_type: (data.user_type === 'admin' || data.user_type === 'mentor' || data.user_type === 'mentee') 
          ? data.user_type 
          : 'mentee'
      };

      return profileData;
    },
    enabled: !!userId && open,
  });

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    queryClient.invalidateQueries({ queryKey: ['profile-admin-edit', userId] });
    toast({
      title: "Success",
      description: "User avatar updated successfully",
    });
  };

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
            <div className="flex items-center gap-2">
              <ProfileAvatar 
                avatarUrl={profile.avatar_url || ""}
                imageAlt={profile.full_name || profile.email}
                size="md"
                editable={true}
                userId={profile.id}
                onAvatarUpdate={handleAvatarUpdate}
              />
              <div>
                <span>{profile.full_name || profile.email}</span>
                <Badge className="ml-2 capitalize">{profile.user_type}</Badge>
              </div>
            </div>
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
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <UserCircle className="h-4 w-4" />
              Profile Details
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            {profile.user_type === 'mentor' && (
              <TabsTrigger value="mentor-settings" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                Mentor Settings
              </TabsTrigger>
            )}
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
                    <h3 className="text-sm font-medium text-muted-foreground">First Name</h3>
                    <p>{profile.first_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Last Name</h3>
                    <p>{profile.last_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                    <p>{profile.location || 'Not specified'}</p>
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
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Highest Degree</h3>
                      <p>{profile.highest_degree || 'Not specified'}</p>
                    </div>
                  </div>
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.tools_used && profile.tools_used.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Tools</h3>
                    <div className="flex flex-wrap gap-1">
                      {profile.tools_used.map((tool, index) => (
                        <Badge key={index} variant="outline">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(profile.linkedin_url || profile.github_url || profile.website_url) && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Links</h3>
                    <div className="space-y-1">
                      {profile.linkedin_url && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">LinkedIn:</span>
                          <a 
                            href={profile.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {profile.linkedin_url}
                          </a>
                        </div>
                      )}
                      {profile.github_url && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">GitHub:</span>
                          <a 
                            href={profile.github_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {profile.github_url}
                          </a>
                        </div>
                      )}
                      {profile.website_url && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Website:</span>
                          <a 
                            href={profile.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {profile.website_url}
                          </a>
                        </div>
                      )}
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

          {profile.user_type === 'mentor' && (
            <TabsContent value="mentor-settings">
              <MentorSettingsTab profile={profile} />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
