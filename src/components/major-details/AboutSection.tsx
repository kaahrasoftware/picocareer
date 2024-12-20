import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";

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
  const mentorsPerPage = 8;

  const { data: mentors } = useQuery({
    queryKey: ['major-mentors', majorId, currentPage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          position,
          company:companies(name)
        `)
        .eq('academic_major_id', majorId)
        .eq('user_type', 'mentor')
        .range((currentPage - 1) * mentorsPerPage, currentPage * mentorsPerPage - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!majorId,
  });

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

  const totalPages = Math.ceil((totalCount || 0) / mentorsPerPage);

  return (
    <div className="space-y-4">
      {mentors && mentors.length > 0 && (
        <div>
          <h5 className="text-sm font-medium mb-3">Mentors with this major</h5>
          <ScrollArea className="w-full pb-2">
            <div className="flex justify-center min-w-full py-2">
              <div className="flex gap-4 px-4">
                {mentors.map((mentor) => (
                  <div key={mentor.id} className="flex flex-col items-center space-y-2">
                    <Avatar 
                      className="h-16 w-16 ring-2 ring-primary/20 shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-shadow hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] cursor-pointer"
                      onClick={() => setSelectedMentorId(mentor.id)}
                    >
                      <AvatarImage src={mentor.avatar_url || ''} alt={mentor.full_name || ''} />
                      <AvatarFallback>{mentor.full_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="text-sm font-medium truncate max-w-[120px]">
                        {mentor.full_name}
                      </p>
                      {mentor.position && (
                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {mentor.position}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
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
