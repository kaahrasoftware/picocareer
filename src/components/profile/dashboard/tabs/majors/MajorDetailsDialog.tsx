
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Major } from "@/types/database/majors";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MajorDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  major: Major;
}

export function MajorDetailsDialog({ open, onClose, major }: MajorDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {major.title}
            <Badge variant={major.status === "Approved" ? "default" : "outline"}>
              {major.status}
            </Badge>
            {major.featured && (
              <Badge variant="secondary">Featured</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{major.description}</p>
            </div>

            {major.career_opportunities && major.career_opportunities.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Career Opportunities</h3>
                <div className="flex flex-wrap gap-2">
                  {major.career_opportunities.map((opportunity, index) => (
                    <Badge key={index} variant="outline">
                      {opportunity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {major.transferable_skills && major.transferable_skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Transferable Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {major.transferable_skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Token Cost:</span> {major.token_cost}
              </div>
              <div>
                <span className="font-medium">Profiles Count:</span> {major.profiles_count}
              </div>
              {major.potential_salary && (
                <div>
                  <span className="font-medium">Potential Salary:</span> {major.potential_salary}
                </div>
              )}
              {major.stress_level && (
                <div>
                  <span className="font-medium">Stress Level:</span> {major.stress_level}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
