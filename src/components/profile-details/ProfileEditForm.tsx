import React from "react";
import { Button } from "@/components/ui/button";
import type { Major } from "@/types/database/majors";
import type { School } from "@/types/database/schools";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { BioSection } from "./form-sections/BioSection";
import { LocationSection } from "./form-sections/LocationSection";
import { ProfessionalSection } from "./form-sections/ProfessionalSection";
import { SkillsSection } from "./form-sections/SkillsSection";
import { LinksSection } from "./form-sections/LinksSection";
import { EducationSection } from "./form-sections/EducationSection";

interface Company {
  id: string;
  name: string;
}

interface ProfileEditFormProps {
  formData: {
    first_name: string;
    last_name: string;
    bio: string;
    position: string;
    company_id: string;
    school_id: string;
    years_of_experience: number;
    skills: string;
    tools_used: string;
    keywords: string;
    fields_of_interest: string;
    linkedin_url: string;
    github_url: string;
    website_url: string;
    highest_degree: "No Degree" | "High School" | "Associate" | "Bachelor" | "Master" | "MD" | "PhD";
    academic_major_id: string;
    location: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange?: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setIsEditing: (value: boolean) => void;
  isMentee: boolean;
  majors: Pick<Major, 'id' | 'title'>[];
  companies: Company[];
  schools: Pick<School, 'id' | 'name'>[];
}

export function ProfileEditForm({ 
  formData, 
  handleInputChange, 
  handleSelectChange,
  handleSubmit, 
  setIsEditing,
  isMentee,
  majors,
  companies,
  schools
}: ProfileEditFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <PersonalInfoSection
          firstName={formData.first_name}
          lastName={formData.last_name}
          handleInputChange={handleInputChange}
        />

        <BioSection
          bio={formData.bio}
          handleInputChange={handleInputChange}
        />

        {!isMentee && (
          <EducationSection
            highestDegree={formData.highest_degree}
            academicMajorId={formData.academic_major_id}
            schoolId={formData.school_id}
            handleSelectChange={handleSelectChange!}
            majors={majors}
            schools={schools}
          />
        )}

        <LocationSection
          location={formData.location}
          handleInputChange={handleInputChange}
        />

        {!isMentee && (
          <ProfessionalSection
            position={formData.position}
            companyId={formData.company_id}
            yearsOfExperience={formData.years_of_experience}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange!}
            companies={companies}
          />
        )}

        {!isMentee && (
          <SkillsSection
            skills={formData.skills}
            tools={formData.tools_used}
            keywords={formData.keywords}
            fieldsOfInterest={formData.fields_of_interest}
            handleInputChange={handleInputChange}
          />
        )}

        <LinksSection
          linkedinUrl={formData.linkedin_url}
          githubUrl={formData.github_url}
          websiteUrl={formData.website_url}
          handleInputChange={handleInputChange}
        />

        <div className="flex gap-4">
          <Button type="submit" variant="default">Save Changes</Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}