import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CareerDetails {
  title: string;
  description: string;
  users: string;
  salary: string;
  imageUrl: string;
  relatedMajors: string[];
  relatedCareers: string[];
  skills: string[];
}

interface CareerDetailsDialogProps {
  career: CareerDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CareerDetailsDialog({ career, open, onOpenChange }: CareerDetailsDialogProps) {
  if (!career) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-kahra-darker">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">{career.title}</DialogTitle>
          <DialogDescription className="text-gray-300">{career.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <img src={career.imageUrl} alt={career.title} className="w-full h-48 object-cover rounded-lg" />
          
          <div className="flex justify-between text-sm text-gray-400">
            <span>{career.users} Users</span>
            <span>{career.salary}</span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Related Majors</h3>
              <div className="flex flex-wrap gap-2">
                {career.relatedMajors?.map((major) => (
                  <span key={major} className="px-3 py-1 bg-kahra-primary/20 rounded-full text-sm text-white">
                    {major}
                  </span>
                )) || <span className="text-gray-400">No related majors listed</span>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Related Careers</h3>
              <div className="flex flex-wrap gap-2">
                {career.relatedCareers?.map((relatedCareer) => (
                  <span key={relatedCareer} className="px-3 py-1 bg-kahra-secondary/20 rounded-full text-sm text-white">
                    {relatedCareer}
                  </span>
                )) || <span className="text-gray-400">No related careers listed</span>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {career.skills?.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-kahra-accent/20 rounded-full text-sm text-white">
                    {skill}
                  </span>
                )) || <span className="text-gray-400">No skills listed</span>}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}