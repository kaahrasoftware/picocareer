import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Skill {
  text: string;
  colorClass: string;
}

const colorClasses = [
  "bg-green-900/50 text-green-400",
  "bg-indigo-900/50 text-indigo-400",
  "bg-blue-900/50 text-blue-400",
  "bg-red-900/50 text-red-400",
  "bg-yellow-900/50 text-yellow-400",
  "bg-purple-900/50 text-purple-400",
  "bg-gray-900/50 text-gray-400",
  "bg-orange-900/50 text-orange-400"
];

export function SkillsList() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['profile-keywords'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('keywords')
        .eq('id', session.user.id)
        .single();

      if (error) {
        toast({
          title: "Error fetching keywords",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Transform keywords into skills with color classes
      return (data?.keywords || []).map((keyword: string, index: number) => ({
        text: keyword,
        colorClass: colorClasses[index % colorClasses.length]
      }));
    },
  });

  useEffect(() => {
    if (skills.length > 6) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex + 6 >= skills.length ? 0 : prevIndex + 1
        );
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [skills.length]);

  if (isLoading || skills.length === 0) {
    return null;
  }

  const visibleSkills = [...skills.slice(currentIndex, currentIndex + 6)];
  if (visibleSkills.length < 6 && skills.length > 6) {
    visibleSkills.push(...skills.slice(0, 6 - visibleSkills.length));
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        {visibleSkills.map((skill, index) => (
          <span
            key={`${skill.text}-${index}`}
            className={`px-2 py-0.5 rounded-full ${skill.colorClass} text-xs whitespace-nowrap transition-all duration-300 ease-in-out`}
          >
            {skill.text}
          </span>
        ))}
      </div>
    </ScrollArea>
  );
}