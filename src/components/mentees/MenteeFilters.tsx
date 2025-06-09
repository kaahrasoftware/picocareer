
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MenteeFiltersProps {
  selectedFilters: {
    major: string;
    school: string;
    gpaRange: string;
    skills: string[];
    academicYear: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function MenteeFilters({ selectedFilters, onFiltersChange }: MenteeFiltersProps) {
  const [skillInput, setSkillInput] = useState('');

  // Fetch majors for filter dropdown
  const { data: majors = [] } = useQuery({
    queryKey: ['majors-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .order('title');
      
      if (error) {
        console.error('Error fetching majors:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Fetch schools for filter dropdown
  const { data: schools = [] } = useQuery({
    queryKey: ['schools-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching schools:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Get popular skills from mentee profiles
  const { data: popularSkills = [] } = useQuery({
    queryKey: ['popular-skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('skills, fields_of_interest')
        .eq('user_type', 'mentee')
        .not('skills', 'is', null);
      
      if (error) {
        console.error('Error fetching skills:', error);
        return [];
      }
      
      const allSkills = new Set<string>();
      data?.forEach(profile => {
        profile.skills?.forEach((skill: string) => allSkills.add(skill));
        profile.fields_of_interest?.forEach((interest: string) => allSkills.add(interest));
      });
      
      return Array.from(allSkills).slice(0, 20); // Top 20 skills
    }
  });

  const handleFilterChange = (key: string, value: any) => {
    // Convert "all" values back to empty strings for filtering logic
    const processedValue = value === "all" ? "" : value;
    
    onFiltersChange({
      ...selectedFilters,
      [key]: processedValue
    });
  };

  const addSkill = (skill: string) => {
    if (skill && !selectedFilters.skills.includes(skill)) {
      handleFilterChange('skills', [...selectedFilters.skills, skill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    handleFilterChange('skills', selectedFilters.skills.filter(skill => skill !== skillToRemove));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      major: '',
      school: '',
      gpaRange: '',
      skills: [],
      academicYear: ''
    });
  };

  const hasActiveFilters = Object.values(selectedFilters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  );

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Major Filter */}
      <Select 
        value={selectedFilters.major || "all"} 
        onValueChange={(value) => handleFilterChange('major', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select major" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Majors</SelectItem>
          {majors.map((major) => (
            <SelectItem key={major.id} value={major.id}>
              {major.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* School Filter */}
      <Select 
        value={selectedFilters.school || "all"} 
        onValueChange={(value) => handleFilterChange('school', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select school" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Schools</SelectItem>
          {schools.map((school) => (
            <SelectItem key={school.id} value={school.id}>
              {school.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* GPA Range Filter */}
      <Select 
        value={selectedFilters.gpaRange || "all"} 
        onValueChange={(value) => handleFilterChange('gpaRange', value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="GPA Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All GPAs</SelectItem>
          <SelectItem value="3.5+">3.5+</SelectItem>
          <SelectItem value="3.0-3.5">3.0 - 3.5</SelectItem>
          <SelectItem value="2.5-3.0">2.5 - 3.0</SelectItem>
          <SelectItem value="below-2.5">Below 2.5</SelectItem>
        </SelectContent>
      </Select>

      {/* Skills Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Skills {selectedFilters.skills.length > 0 && `(${selectedFilters.skills.length})`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium">Filter by Skills</h4>
            
            {/* Selected Skills */}
            {selectedFilters.skills.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Selected:</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedFilters.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Skills */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700">Popular Skills:</h5>
              <div className="flex flex-wrap gap-1">
                {popularSkills
                  .filter(skill => !selectedFilters.skills.includes(skill))
                  .slice(0, 10)
                  .map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => addSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearAllFilters}
          className="text-gray-500 hover:text-gray-700"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
