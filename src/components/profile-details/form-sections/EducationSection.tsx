import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Major } from "@/types/database/majors";
import type { School } from "@/types/database/schools";
import { useToast } from "@/hooks/use-toast";

interface EducationSectionProps {
  highestDegree: string;
  academicMajorId: string;
  schoolId: string;
  handleSelectChange: (name: string, value: string) => void;
  majors: Pick<Major, 'id' | 'title'>[];
  schools: Pick<School, 'id' | 'name'>[];
}

export function EducationSection({
  highestDegree,
  academicMajorId,
  schoolId,
  handleSelectChange,
  majors,
  schools,
}: EducationSectionProps) {
  const [showCustomMajor, setShowCustomMajor] = useState(false);
  const [showCustomSchool, setShowCustomSchool] = useState(false);
  const [customMajor, setCustomMajor] = useState("");
  const [customSchool, setCustomSchool] = useState("");
  const { toast } = useToast();

  const degreeOptions = [
    "No Degree",
    "High School",
    "Associate",
    "Bachelor",
    "Master",
    "MD",
    "PhD"
  ] as const;

  const handleCustomMajorSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('majors')
        .insert([
          { 
            title: customMajor,
            description: `Custom major: ${customMajor}`,
          }
        ])
        .select('id, title')
        .single();

      if (error) throw error;

      if (data) {
        handleSelectChange('academic_major_id', data.id);
        setShowCustomMajor(false);
        setCustomMajor("");
        toast({
          title: "Success",
          description: "New major added successfully",
        });
      }
    } catch (error: any) {
      if (error?.code === '23505') { // Unique violation
        toast({
          title: "Error",
          description: "This major already exists. Please select it from the list.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add new major",
          variant: "destructive",
        });
      }
    }
  };

  const handleCustomSchoolSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert([
          { 
            name: customSchool,
          }
        ])
        .select('id, name')
        .single();

      if (error) throw error;

      if (data) {
        handleSelectChange('school_id', data.id);
        setShowCustomSchool(false);
        setCustomSchool("");
        toast({
          title: "Success",
          description: "New school added successfully",
        });
      }
    } catch (error: any) {
      if (error?.code === '23505') { // Unique violation
        toast({
          title: "Error",
          description: "This school already exists. Please select it from the list.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add new school",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Education</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Highest Degree</label>
          <Select 
            value={highestDegree} 
            onValueChange={(value) => handleSelectChange('highest_degree', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your highest degree" />
            </SelectTrigger>
            <SelectContent>
              {degreeOptions.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Academic Major</label>
          {!showCustomMajor ? (
            <>
              <Select 
                value={academicMajorId} 
                onValueChange={(value) => {
                  if (value === "other") {
                    setShowCustomMajor(true);
                  } else {
                    handleSelectChange('academic_major_id', value);
                  }
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your major" />
                </SelectTrigger>
                <SelectContent>
                  {majors.map((major) => (
                    <SelectItem key={major.id} value={major.id}>
                      {major.title}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other (Add New)</SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : (
            <div className="space-y-2">
              <Input
                value={customMajor}
                onChange={(e) => setCustomMajor(e.target.value)}
                placeholder="Enter major name"
                className="mt-1"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCustomMajorSubmit}
                  className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomMajor(false)}
                  className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">School</label>
          {!showCustomSchool ? (
            <>
              <Select 
                value={schoolId} 
                onValueChange={(value) => {
                  if (value === "other") {
                    setShowCustomSchool(true);
                  } else {
                    handleSelectChange('school_id', value);
                  }
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other (Add New)</SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : (
            <div className="space-y-2">
              <Input
                value={customSchool}
                onChange={(e) => setCustomSchool(e.target.value)}
                placeholder="Enter school name"
                className="mt-1"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCustomSchoolSubmit}
                  className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomSchool(false)}
                  className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}