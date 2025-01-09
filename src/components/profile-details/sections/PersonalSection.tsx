import { Profile } from "@/types/database/profiles";

export interface PersonalSectionProps {
  profile: Profile & {
    company_name?: string;
    school_name?: string;
    academic_major?: string;
  };
}

export function PersonalSection({ profile }: PersonalSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Personal Information</h2>
      <div className="flex flex-col">
        <span className="text-sm font-medium">Full Name</span>
        <span className="text-sm">{profile.full_name}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">Email</span>
        <span className="text-sm">{profile.email}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">Location</span>
        <span className="text-sm">{profile.location}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">Company</span>
        <span className="text-sm">{profile.company_name || 'N/A'}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">School</span>
        <span className="text-sm">{profile.school_name || 'N/A'}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">Academic Major</span>
        <span className="text-sm">{profile.academic_major || 'N/A'}</span>
      </div>
    </div>
  );
}
