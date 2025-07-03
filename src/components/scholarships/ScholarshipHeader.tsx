import { GraduationCap } from "lucide-react";
import { ScholarshipScraperButton } from "./ScholarshipScraperButton";
interface ScholarshipHeaderProps {
  onScrapingComplete?: () => void;
}
export function ScholarshipHeader({
  onScrapingComplete
}: ScholarshipHeaderProps) {
  return <div className="text-center space-y-4">
      <div className="flex justify-center items-center gap-3 mb-4">
        <div className="p-3 bg-blue-100 rounded-full">
          <GraduationCap className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Scholarships & Funding
        </h1>
      </div>
      
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Discover scholarships, grants, and fellowships to fund your education journey. 
        Find opportunities specifically designed for international students.
      </p>

      
    </div>;
}