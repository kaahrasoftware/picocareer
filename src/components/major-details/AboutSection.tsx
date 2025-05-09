import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useNavigate } from "react-router-dom";

interface AboutSectionProps {
  description: string;
  learning_objectives?: string[];
  interdisciplinary_connections?: string[];
  majorId: string;
}

export function AboutSection({ 
  description, 
  learning_objectives,
  interdisciplinary_connections,
  majorId
}: AboutSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const { toast } = useToast();
  const { session } = useAuthSession();
  const navigate = useNavigate();
  const MENTORS_PER_PAGE = 6;

  const { data: totalCount } = useQuery({
    queryKey: ['major-mentors-count', majorId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('academic_major_id', majorId)
        .eq('user_type', 'mentor');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!majorId,
  });

  const { data: mentors } = useQuery({
    queryKey: ['major-mentors', majorId, currentPage],
    queryFn: async () => {
      const start = (currentPage - 1) * MENTORS_PER_PAGE;
      const end = start + MENTORS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          position,
          company:companies(name)
        `)
        .eq('academic_major_id', majorId)
        .eq('user_type', 'mentor')
        .range(start, end)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!majorId,
  });

  const handleMentorClick = (mentorId: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view mentor profiles and connect with them!",
        variant: "default",
        className: "bg-green-50 border-green-200",
        action: (
          <button
            onClick={() => navigate("/auth")}
            className="bg-green-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
          >
            Login
          </button>
        ),
      });
      return;
    }
    setSelectedMentorId(mentorId);
  };

  const totalPages = Math.ceil((totalCount || 0) / MENTORS_PER_PAGE);

  return (
    <div className="space-y-6">
      {mentors && mentors.length > 0 && (
        <div>
          <h5 className="text-sm font-medium mb-4">Mentors with this major</h5>
          <ScrollArea className="w-full pb-4">
            <div className="flex justify-center min-w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
                {mentors.map((mentor) => (
                  <Card 
                    key={mentor.id}
                    className="flex flex-col items-center p-6 hover:bg-accent/50 transition-colors cursor-pointer w-[120px]"
                    onClick={() => handleMentorClick(mentor.id)}
                  >
                    <div className="relative w-16 h-16 group mb-3">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-picocareer-primary to-picocareer-secondary" />
                      <div className="absolute inset-[2px] rounded-full bg-background" />
                      <div className="absolute inset-[4px] rounded-full overflow-hidden">
                        <Avatar className="h-full w-full">
                          <AvatarImage 
                            src={mentor.avatar_url || ''} 
                            alt={`${mentor.first_name} ${mentor.last_name}`}
                            className="h-full w-full object-cover"
                          />
                          <AvatarFallback>
                            {mentor.first_name?.[0]}
                            {mentor.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div className="text-center w-full space-y-0.5">
                      <p className="text-sm font-medium line-clamp-1">
                        {mentor.first_name}
                      </p>
                      <p className="text-sm font-medium line-clamp-1">
                        {mentor.last_name}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
          {totalPages > 1 && (
            <div className="mt-6">
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          About this Major
        </h4>
        <p className="text-muted-foreground">{description}</p>
        
        {learning_objectives && learning_objectives.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-medium mb-2">
              Learning Objectives
            </h5>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {learning_objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
        )}

        {interdisciplinary_connections && interdisciplinary_connections.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-medium mb-2">
              Interdisciplinary Connections
            </h5>
            <div className="flex flex-wrap gap-2">
              {interdisciplinary_connections.map((connection, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="bg-[#D3E4FD] text-[#4B5563]"
                >
                  {connection}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedMentorId && (
        <ProfileDetailsDialog
          userId={selectedMentorId}
          open={!!selectedMentorId}
          onOpenChange={(open) => !open && setSelectedMentorId(null)}
        />
      )}
    </div>
  );
}