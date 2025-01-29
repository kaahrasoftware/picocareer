import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function EventUpload() {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { toast } = useToast();

  useEffect(() => {
    if (profile && profile.user_type !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can access this page",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [profile, navigate, toast]);

  // If profile is not loaded yet, don't redirect
  if (!profile) return null;

  // If user is not admin, don't render the page
  if (profile.user_type !== 'admin') return null;

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
      <p>Form has been removed.</p>
    </div>
  );
}