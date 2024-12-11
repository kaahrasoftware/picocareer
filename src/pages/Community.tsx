import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileCard } from "@/components/community/ProfileCard";
import { SearchBar } from "@/components/SearchBar";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Community() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredProfiles = profiles?.filter(profile => {
    const matchesSearch = searchQuery === "" || 
      profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.academic_major?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.position?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill = !selectedSkill || 
      profile.skills?.includes(selectedSkill);

    return matchesSearch && matchesSkill;
  });

  const allSkills = Array.from(new Set(
    profiles?.flatMap(p => p.skills || []) || []
  )).sort();

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Community</h1>
        <p className="text-muted-foreground mb-6">
          Connect with students, mentors, and professionals in your field of interest.
        </p>
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
          <div className="flex-1">
            <SearchBar 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, major, or position..."
              className="max-w-xl"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => (
              <Badge
                key={skill}
                variant={selectedSkill === skill ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-6 rounded-lg border bg-card">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles?.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}