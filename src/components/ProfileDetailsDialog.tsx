import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Building2, GraduationCap, Link, Github, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileDetailsDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDetailsDialog({ userId, open, onOpenChange }: ProfileDetailsDialogProps) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          company:companies(name),
          school:schools(name),
          academic_major:majors!profiles_academic_major_id_fkey(title)
        `)
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return {
        ...data,
        company_name: data.company?.name,
        school_name: data.school?.name,
        academic_major: data.academic_major?.title
      };
    },
    enabled: !!userId && open,
  });

  if (isLoading || !profile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 bg-picocareer-dark text-white border border-picocareer-darker">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2>{profile.full_name}</h2>
                {profile.user_type === 'mentor' && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                    mentor
                  </Badge>
                )}
              </div>
              <p className="text-base font-normal text-gray-400">@{profile.username}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-120px)] px-6">
          <div className="space-y-6 pb-6">
            {(profile.company_name || profile.position) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Building2 size={16} />
                  <span>{profile.company_name}</span>
                </div>
                {profile.position && (
                  <h3 className="text-xl font-semibold">{profile.position}</h3>
                )}
              </div>
            )}

            {(profile.academic_major || profile.academic_major || profile.highest_degree) && (
              <div className="bg-picocareer-darker rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Education</h4>
                {profile.academic_major && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <GraduationCap size={16} />
                    <span>{profile.academic_major}</span>
                  </div>
                )}
                {profile.highest_degree && (
                  <Badge variant="outline" className="mr-2">
                    {profile.highest_degree}
                  </Badge>
                )}
              </div>
            )}

            {profile.bio && (
              <div className="bg-picocareer-darker rounded-lg p-4">
                <h4 className="font-semibold mb-2">About</h4>
                <p className="text-gray-400">{profile.bio}</p>
              </div>
            )}

            {(profile.skills?.length > 0 || profile.tools_used?.length > 0) && (
              <div className="bg-picocareer-darker rounded-lg p-4 space-y-4">
                {profile.skills?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.tools_used?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.tools_used.map((tool, index) => (
                        <Badge key={index} variant="outline">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(profile.linkedin_url || profile.github_url || profile.website_url) && (
              <div className="bg-picocareer-darker rounded-lg p-4">
                <h4 className="font-semibold mb-2">Links</h4>
                <div className="space-y-2">
                  {profile.linkedin_url && (
                    <a 
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Link size={16} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {profile.github_url && (
                    <a 
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Github size={16} />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profile.website_url && (
                    <a 
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Globe size={16} />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}