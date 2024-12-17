import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Building2, GraduationCap, Link, Github, Globe, MapPin, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { BookSessionDialog } from "./BookSessionDialog";

interface ProfileDetailsDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDetailsDialog({ userId, open, onOpenChange }: ProfileDetailsDialogProps) {
  const [bookingOpen, setBookingOpen] = useState(false);

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

  const displayTitle = profile.position || profile.academic_major || "No position/major set";
  const displaySubtitle = profile.position 
    ? profile.company_name || "No company set"
    : profile.school_name || "No school set";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                  {profile.top_mentor ? (
                    <Badge className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30 flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Top Mentor
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                      mentor
                    </Badge>
                  )}
                </div>
                <p className="text-lg font-medium text-foreground/90">{displayTitle}</p>
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {profile.position ? (
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <GraduationCap className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span>{displaySubtitle}</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[calc(85vh-120px)] px-6">
            <div className="space-y-6 pb-6">
              {profile.bio && (
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              )}

              {(profile.skills?.length > 0 || profile.tools_used?.length > 0) && (
                <div className="bg-muted rounded-lg p-4 space-y-4">
                  {profile.skills?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <Badge 
                            key={index} 
                            className="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                          >
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
                          <Badge 
                            key={index} 
                            className="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
                          >
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(profile.academic_major || profile.highest_degree) && (
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Education</h4>
                  {profile.academic_major && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
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

              {(profile.linkedin_url || profile.github_url || profile.website_url) && (
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Links</h4>
                  <div className="space-y-2">
                    {profile.linkedin_url && (
                      <a 
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Link className="h-4 w-4" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {profile.github_url && (
                      <a 
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {profile.website_url && (
                      <a 
                        href={profile.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button 
                  size="lg"
                  onClick={() => setBookingOpen(true)}
                  className="w-full md:w-auto"
                >
                  Book a Session
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <BookSessionDialog
        mentor={{
          id: userId,
          name: profile.full_name || '',
          imageUrl: profile.avatar_url || ''
        }}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />
    </>
  );
}