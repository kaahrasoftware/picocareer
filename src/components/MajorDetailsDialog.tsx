import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MajorDetailsDialogProps {
  major: {
    title: string;
    description: string;
    users: string;
    imageUrl: string;
    relatedCareers: string[];
    requiredCourses: string[];
    averageGPA: string;
    fieldOfStudy?: string;
    degreeLevel?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MajorDetailsDialog({ major, open, onOpenChange }: MajorDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{major.title}</DialogTitle>
          {major.fieldOfStudy && (
            <Badge variant="outline" className="w-fit">
              {major.fieldOfStudy}
            </Badge>
          )}
        </DialogHeader>
        
        <ScrollArea className="h-[60vh]">
          <div className="space-y-6">
            <img 
              src={major.imageUrl} 
              alt={major.title} 
              className="w-full h-48 object-cover rounded-lg"
            />
            
            <div>
              <h4 className="text-lg font-semibold mb-2">About this Major</h4>
              <p className="text-muted-foreground">{major.description}</p>
            </div>

            {major.degreeLevel && (
              <div>
                <h4 className="text-lg font-semibold mb-2">Degree Level</h4>
                <Badge variant="secondary">{major.degreeLevel}</Badge>
              </div>
            )}
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Required Courses</h4>
              <div className="flex flex-wrap gap-2">
                {major.requiredCourses.map((course, index) => (
                  <Badge key={index} variant="outline">{course}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">Career Opportunities</h4>
              <div className="flex flex-wrap gap-2">
                {major.relatedCareers.map((career, index) => (
                  <Badge key={index} variant="secondary">{career}</Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
              <span>Average GPA: {major.averageGPA}</span>
              <span>{major.users} Active Students</span>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}