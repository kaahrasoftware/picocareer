import React from "react";

interface ProfileTabProps {
  profile: {
    user_type?: string;
    full_name?: string;
    academic_major?: string;
    school_name?: string;
    position?: string;
    company_name?: string;
    highest_degree?: string;
    bio?: string;
    linkedin_url?: string;
    github_url?: string;
    website_url?: string;
    years_of_experience?: number;
  } | null;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const isMentee = profile?.user_type === 'mentee';

  return (
    <div className="space-y-6 px-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-gray-400">Profile type:</p>
          <p>{profile?.user_type || 'Not set'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400">Full Name:</p>
          <p>{profile?.full_name || 'Not set'}</p>
        </div>
        {!isMentee && profile?.academic_major && (
          <div className="space-y-2">
            <p className="text-gray-400">Major:</p>
            <p>{profile.academic_major || 'Not set'}</p>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-gray-400">School:</p>
          <p>{profile?.school_name || 'Not set'}</p>
        </div>
        {!isMentee && (
          <>
            <div className="space-y-2">
              <p className="text-gray-400">Position:</p>
              <p>{profile?.position || 'Not set'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400">Company:</p>
              <p>{profile?.company_name || 'Not set'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400">Highest Degree:</p>
              <p>{profile?.highest_degree || 'Not set'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400">Years of Experience:</p>
              <p>{profile?.years_of_experience || 'Not set'}</p>
            </div>
          </>
        )}
        <div className="col-span-2 space-y-2">
          <p className="text-gray-400">Bio:</p>
          <p className="text-sm">{profile?.bio || 'No bio available'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400">LinkedIn:</p>
          <p>{profile?.linkedin_url ? (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              View Profile
            </a>
          ) : 'Not set'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400">GitHub:</p>
          <p>{profile?.github_url ? (
            <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              View Profile
            </a>
          ) : 'Not set'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400">Website:</p>
          <p>{profile?.website_url ? (
            <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Visit Website
            </a>
          ) : 'Not set'}</p>
        </div>
      </div>
    </div>
  );
}