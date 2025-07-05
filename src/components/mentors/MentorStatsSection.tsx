import { Card } from "@/components/ui/card";
import { Globe, Building, Users, MapPin } from "lucide-react";
interface MentorStatsSectionProps {
  mentors: any[];
}
export function MentorStatsSection({
  mentors
}: MentorStatsSectionProps) {
  // Calculate stats
  const totalMentors = mentors.length;
  const countries = [...new Set(mentors.map(m => m.location?.split(',').pop()?.trim()).filter(Boolean))];
  const companies = [...new Set(mentors.map(m => m.company_name).filter(Boolean))];
  return <div className="mb-12 space-y-8">
      {/* Top Companies with Auto-Scroll */}
      <Card className="p-6 border-0">
        <div className="flex items-center gap-3 mb-4">
          <Building className="w-5 h-5 text-[#00A6D4]" />
          <h3 className="text-lg font-semibold text-gray-900">Top Companies</h3>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-r from-[#00A6D4]/5 to-[#33b3d9]/5 rounded-lg p-3">
          <div className="flex animate-scroll-horizontal space-x-4 whitespace-nowrap">
            {/* Duplicate companies for seamless loop */}
            {[...companies, ...companies].map((company, index) => <span key={`${company}-${index}`} className="inline-block px-4 py-2 bg-[#00A6D4]/10 rounded-full text-sm font-medium hover:bg-[#00A6D4]/20 inline-block duration-200 cursor-pointer flex-shrink-0 text-gray-950">
                {company}
              </span>)}
          </div>
        </div>
        {companies.length > 0}
      </Card>

      {/* Mentor Locations with Auto-Scroll */}
      <Card className="p-6 border-0">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-5 h-5 text-[#33b3d9]" />
          <h3 className="text-lg font-semibold text-gray-900">Mentor Locations</h3>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-r from-[#33b3d9]/5 to-[#00A6D4]/5 rounded-lg p-3">
          <div className="flex animate-scroll-horizontal space-x-4 whitespace-nowrap">
            {/* Duplicate countries for seamless loop */}
            {[...countries, ...countries].map((country, index) => <span key={`${country}-${index}`} className="inline-block px-4 py-2 bg-[#33b3d9]/10 text-[#33b3d9] rounded-full text-sm font-medium hover:bg-[#33b3d9]/20 transition-colors duration-200 cursor-pointer flex-shrink-0">
                {country}
              </span>)}
          </div>
        </div>
        {countries.length > 0}
      </Card>
    </div>;
}