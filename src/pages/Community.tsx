import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileCard } from "@/components/community/ProfileCard";
import { SearchBar } from "@/components/SearchBar";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function Community() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [userTypeFilter, setUserTypeFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Extract unique values for filters
  const locations = Array.from(new Set(profiles?.map(p => p.location).filter(Boolean) || [])).sort();
  const companies = Array.from(new Set(profiles?.map(p => p.company_name).filter(Boolean) || [])).sort();
  const schools = Array.from(new Set(profiles?.map(p => p.school_name).filter(Boolean) || [])).sort();
  const fields = Array.from(new Set(profiles?.flatMap(p => p.fields_of_interest || []) || [])).sort();
  const allSkills = Array.from(new Set(profiles?.flatMap(p => p.skills || []) || [])).sort();

  const filteredProfiles = profiles?.filter(profile => {
    const matchesSearch = searchQuery === "" || 
      profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      profile.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.every(skill => profile.skills?.includes(skill));
    const matchesUserType = !userTypeFilter || profile.user_type === userTypeFilter;
    const matchesLocation = !locationFilter || profile.location === locationFilter;
    const matchesCompany = !companyFilter || profile.company_name === companyFilter;
    const matchesSchool = !schoolFilter || profile.school_name === schoolFilter;
    const matchesField = !fieldFilter || profile.fields_of_interest?.includes(fieldFilter);

    return matchesSearch && matchesSkills && matchesUserType && 
           matchesLocation && matchesCompany && matchesSchool && matchesField;
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Community</h1>
        <p className="text-muted-foreground mb-6">
          Connect with students, mentors, and professionals in your field of interest.
        </p>
        
        <div className="space-y-4">
          <div className="flex-1">
            <SearchBar 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skills, company, position, school, or location..."
              className="max-w-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select value={userTypeFilter || "all"} onValueChange={(value) => setUserTypeFilter(value === "all" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter || "all"} onValueChange={(value) => setLocationFilter(value === "all" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={companyFilter || "all"} onValueChange={(value) => setCompanyFilter(value === "all" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={schoolFilter || "all"} onValueChange={(value) => setSchoolFilter(value === "all" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="School" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school} value={school}>{school}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={fieldFilter || "all"} onValueChange={(value) => setFieldFilter(value === "all" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Field of Interest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {fields.map((field) => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Command className="rounded-lg border shadow-md">
              <CommandGroup className="h-full overflow-auto">
                <div className="flex flex-wrap gap-1 p-2">
                  {selectedSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="mr-1 mb-1"
                      onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
                {allSkills.map((skill) => (
                  <CommandItem
                    key={skill}
                    onSelect={() => {
                      if (selectedSkills.includes(skill)) {
                        setSelectedSkills(selectedSkills.filter(s => s !== skill));
                      } else {
                        setSelectedSkills([...selectedSkills, skill]);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedSkills.includes(skill) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {skill}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-6 rounded-lg border bg-card">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles?.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}