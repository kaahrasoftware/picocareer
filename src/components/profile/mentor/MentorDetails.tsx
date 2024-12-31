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
          <li><strong>Company:</strong> {profile.company_name}</li>
          <li><strong>School:</strong> {profile.school_name}</li>
          <li><strong>Academic Major:</strong> {profile.academic_major}</li>
          <li><strong>Career Title:</strong> {profile.career?.title}</li>
        </ul>
      </div>
    </div>
  );
}