import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CareerDetailsDialogProps {
  careerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CareerDetailsDialog({ careerId, open, onOpenChange }: CareerDetailsDialogProps) {
  const { data: career, isLoading } = useQuery({
    queryKey: ['career', careerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('*, career_major_relations(major:majors(title))')
        .eq('id', careerId)
        .single();

      if (error) throw error;
      return data as CareerDetails;
    },
    enabled: open && !!careerId,
  });

  if (!open) return null;
  if (isLoading) return <div>Loading...</div>;
  if (!career) return <div>Career not found</div>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-foreground">{career.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{career.description}</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-120px)] px-6">
          <div className="space-y-6 pb-6">
            {career.image_url && (
              <img src={career.image_url} alt={career.title} className="w-full h-48 object-cover rounded-lg" />
            )}
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{career.industry}</span>
              <span>{career.salary_range || `$${career.average_salary?.toLocaleString()}`}</span>
            </div>

            {career.required_education && career.required_education.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Required Education</h3>
                <div className="flex flex-wrap gap-2">
                  {career.required_education.map((education) => (
                    <span key={education} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                      {education}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {career.required_skills && career.required_skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {career.required_skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {career.required_tools && career.required_tools.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Required Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {career.required_tools.map((tool) => (
                    <span key={tool} className="px-3 py-1 bg-accent/20 text-accent-foreground rounded-full text-sm">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {career.job_outlook && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Job Outlook</h3>
                <p className="text-muted-foreground">{career.job_outlook}</p>
              </div>
            )}

            {career.work_environment && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Work Environment</h3>
                <p className="text-muted-foreground">{career.work_environment}</p>
              </div>
            )}

            {career.growth_potential && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Growth Potential</h3>
                <p className="text-muted-foreground">{career.growth_potential}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}