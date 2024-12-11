import React from "react";

interface ProfileTabProps {
  profile: {
    user_type?: string;
    full_name?: string;
    academic_major?: string;
    school_name?: string;
    position?: string;
    company_name?: string;
  } | null;
}

export function ProfileTab({ profile }: ProfileTabProps) {
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
        <div className="space-y-2">
          <p className="text-gray-400">Major:</p>
          <p>{profile?.academic_major || 'Not set'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400">School:</p>
          <p>{profile?.school_name || 'Not set'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400">Position:</p>
          <p>{profile?.position || 'Not set'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400">Company:</p>
          <p>{profile?.company_name || 'Not set'}</p>
        </div>
      </div>
    </div>
  );
}