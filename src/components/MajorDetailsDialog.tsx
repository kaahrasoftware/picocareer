import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface MajorDetailsDialogProps {
  major: {
    title: string;
    description: string;
    users: string;
    imageUrl: string;
    relatedCareers: string[];
    requiredCourses: string[];
    averageGPA: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MajorDetailsDialog({ major, open, onOpenChange }: MajorDetailsDialogProps) {
  if (!major) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-kahra-dark text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{major.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <img src={major.imageUrl} alt={major.title} className="w-full h-48 object-cover rounded-lg" />
          <p className="text-gray-300">{major.description}</p>
          
          <div>
            <h4 className="font-semibold mb-2">Required Courses</h4>
            <div className="flex flex-wrap gap-2">
              {major.requiredCourses?.map((course, index) => (
                <Badge key={index} variant="secondary">{course}</Badge>
              )) || <span className="text-gray-400">No required courses listed</span>}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Related Careers</h4>
            <div className="flex flex-wrap gap-2">
              {major.relatedCareers?.map((career, index) => (
                <Badge key={index} variant="outline">{career}</Badge>
              )) || <span className="text-gray-400">No related careers listed</span>}
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-400">
            <span>Average GPA: {major.averageGPA}</span>
            <span>{major.users} Active Students</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}