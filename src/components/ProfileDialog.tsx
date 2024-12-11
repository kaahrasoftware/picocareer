import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileTab } from "./profile/ProfileTab";
import { DashboardTab } from "./profile/DashboardTab";
import { SettingsTab } from "./profile/SettingsTab";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { toast } = useToast();
  
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
    enabled: !!session?.user?.id && open,
  });

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-kahra-darker text-white overflow-y-auto overflow-x-hidden">
          <div className="animate-pulse">
            <div className="h-40 bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-700 rounded mb-2 w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded mb-4 w-1/4"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-kahra-darker text-white overflow-y-auto overflow-x-hidden">
        <ProfileHeader profile={profile} />

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-border">
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="w-full">
            <TabsContent value="profile" className="mt-4">
              <ProfileTab profile={profile} />
            </TabsContent>

            <TabsContent value="dashboard" className="mt-4">
              <DashboardTab />
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <SettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}