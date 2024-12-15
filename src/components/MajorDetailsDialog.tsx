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
  // Ensure we have default values for arrays to prevent map errors
  const requiredCourses = major?.requiredCourses || [];
  const relatedCareers = major?.relatedCareers || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">{major?.title}</DialogTitle>
          {major?.fieldOfStudy && (
            <Badge variant="outline" className="w-fit">
              {major.fieldOfStudy}
            </Badge>
          )}
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-120px)] px-6">
          <div className="space-y-6 pb-6">
            {major?.imageUrl && (
              <img 
                src={major.imageUrl} 
                alt={major.title} 
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            
            <div>
              <h4 className="text-lg font-semibold mb-2">About this Major</h4>
              <p className="text-muted-foreground">{major?.description}</p>
            </div>

            {major?.degreeLevel && (
              <div>
                <h4 className="text-lg font-semibold mb-2">Degree Level</h4>
                <Badge variant="secondary">{major.degreeLevel}</Badge>
              </div>
            )}
            
            {requiredCourses.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-2">Required Courses</h4>
                <div className="flex flex-wrap gap-2">
                  {requiredCourses.map((course, index) => (
                    <Badge key={index} variant="outline">{course}</Badge>
                  ))}
                </div>
              </div>
            )}

            {relatedCareers.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-2">Career Opportunities</h4>
                <div className="flex flex-wrap gap-2">
                  {relatedCareers.map((career, index) => (
                    <Badge key={index} variant="secondary">{career}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
              <span>Average GPA: {major?.averageGPA || 'N/A'}</span>
              <span>{major?.users || '0'} Active Students</span>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}