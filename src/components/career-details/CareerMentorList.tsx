import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useProfileSession } from "@/hooks/useProfileSession";

interface CareerMentorListProps {
  careerId: string;
}

export function CareerMentorList({ careerId }: CareerMentorListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useProfileSession();
  const MENTORS_PER_PAGE = 6;

  const { data: mentors, isLoading, error } = useQuery({
    queryKey: ['career-mentors', careerId, currentPage],
    queryFn: async () => {
      const start = (currentPage - 1) * MENTORS_PER_PAGE;
      const end = start + MENTORS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url
        `, { count: 'exact' })
        .eq('position', careerId)
        .eq('user_type', 'mentor')
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      return {
        mentors: data,
        total: count || 0
      };
    },
    enabled: !!careerId,
  });

  const handleMentorClick = (mentorId: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view mentor profiles and connect with them!",
        variant: "default",
        className: "bg-green-50 border-green-200",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/auth")}
            className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
          >
            Login
          </Button>
        ),
      });
      return;
    }
    setSelectedMentorId(mentorId);
  };

  if (isLoading) {
    return <div>Loading mentors...</div>;
  }

  if (error) {
    console.error('Error fetching mentors:', error);
    return <div>Error loading mentors. Please try again later.</div>;
  }

  if (!mentors || mentors.mentors.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(mentors.total / MENTORS_PER_PAGE);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Career Mentors
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
        {mentors.mentors.map((mentor) => (
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

      {totalPages > 1 && (
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <ProfileDetailsDialog
        userId={selectedMentorId}
        open={!!selectedMentorId}
        onOpenChange={(open) => !open && setSelectedMentorId(null)}
      />
    </div>
  );
}