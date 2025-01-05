import type { Profile } from "@/types/database/profiles";

interface DashboardTabProps {
  profile: Profile;
}

export function DashboardTab({ profile }: DashboardTabProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <p>Welcome, {profile.full_name}!</p>
      <p>Your email: {profile.email}</p>
      <p>Company: {profile.company_name || "N/A"}</p>
      <p>School: {profile.school_name || "N/A"}</p>
      <p>Languages: {profile.languages?.join(", ") || "N/A"}</p>
      <p>Fields of Interest: {profile.fields_of_interest?.join(", ") || "N/A"}</p>
      <p>Bio: {profile.bio || "N/A"}</p>
    </div>
  );
}
