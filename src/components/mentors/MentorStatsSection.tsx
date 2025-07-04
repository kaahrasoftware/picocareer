
import { Card } from "@/components/ui/card";
import { Globe, Building, Users, MapPin } from "lucide-react";

interface MentorStatsSectionProps {
  mentors: any[];
}

export function MentorStatsSection({ mentors }: MentorStatsSectionProps) {
  // Calculate stats
  const totalMentors = mentors.length;
  const countries = [...new Set(mentors.map(m => m.location?.split(',').pop()?.trim()).filter(Boolean))];
  const companies = [...new Set(mentors.map(m => m.company_name).filter(Boolean))];
  const topCompanies = companies.slice(0, 8);
  const topCountries = countries.slice(0, 12);

  return (
    <div className="mb-12 space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-0 bg-gradient-to-br from-[#00A6D4]/5 to-[#00A6D4]/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00A6D4] rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalMentors}</p>
              <p className="text-gray-600">Expert Mentors</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 bg-gradient-to-br from-[#33b3d9]/5 to-[#33b3d9]/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#33b3d9] rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{countries.length}</p>
              <p className="text-gray-600">Countries</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 bg-gradient-to-br from-[#0095c1]/5 to-[#0095c1]/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0095c1] rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
              <p className="text-gray-600">Companies</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Companies */}
      <Card className="p-6 border-0">
        <div className="flex items-center gap-3 mb-4">
          <Building className="w-5 h-5 text-[#00A6D4]" />
          <h3 className="text-lg font-semibold text-gray-900">Top Companies</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {topCompanies.map((company, index) => (
            <span
              key={company}
              className="px-3 py-1 bg-[#00A6D4]/10 text-[#00A6D4] rounded-full text-sm font-medium"
            >
              {company}
            </span>
          ))}
          {companies.length > 8 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              +{companies.length - 8} more
            </span>
          )}
        </div>
      </Card>

      {/* Top Countries */}
      <Card className="p-6 border-0">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-5 h-5 text-[#00A6D4]" />
          <h3 className="text-lg font-semibold text-gray-900">Mentor Locations</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {topCountries.map((country, index) => (
            <span
              key={country}
              className="px-3 py-1 bg-[#33b3d9]/10 text-[#33b3d9] rounded-full text-sm font-medium"
            >
              {country}
            </span>
          ))}
          {countries.length > 12 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              +{countries.length - 12} more
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
