import { Lightbulb, GraduationCap, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const { data: mentors } = useQuery({
    queryKey: ['major-mentors', majorId],
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
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!majorId
  });

  return (
    <div className="space-y-6">
      {mentors && mentors.length > 0 && (
        <div>
          <h5 className="text-sm font-medium mb-3">Mentors with this major</h5>
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex gap-4">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="flex flex-col items-center space-y-2">
                  <Avatar className="h-16 w-16">
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
          </ScrollArea>
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
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
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
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-primary" />
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
    </div>
  );
}