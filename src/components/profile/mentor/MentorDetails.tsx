
import type { Profile } from "@/types/database/profiles";

interface MentorDetailsProps {
  profile: Profile;
}

export function MentorDetails({ profile }: MentorDetailsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold">{profile.full_name}</h2>
      <p className="text-gray-600">{profile.bio}</p>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Details</h3>
        <ul className="list-disc list-inside">
          <li><strong>Location:</strong> {profile.location}</li>
          {profile.company_id && <li><strong>Company ID:</strong> {profile.company_id}</li>}
          {profile.school_id && <li><strong>School ID:</strong> {profile.school_id}</li>}
          {profile.academic_major_id && <li><strong>Academic Major ID:</strong> {profile.academic_major_id}</li>}
          {profile.position && <li><strong>Position:</strong> {profile.position}</li>}
        </ul>
      </div>
    </div>
  );
}
