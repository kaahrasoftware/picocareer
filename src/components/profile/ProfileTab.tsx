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

  const InfoField = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="bg-muted/50 rounded-lg p-4 space-y-1 hover:bg-muted/70 transition-colors">
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <p className="text-foreground">{value || 'Not set'}</p>
    </div>
  );

  return (
    <div className="space-y-8 px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoField label="Profile type" value={profile?.user_type || 'Not set'} />
        <InfoField label="Full Name" value={profile?.full_name} />
        
        {!isMentee && profile?.academic_major && (
          <InfoField label="Major" value={profile.academic_major} />
        )}
        
        <InfoField label="School" value={profile?.school_name} />
        
        {!isMentee && (
          <>
            <InfoField label="Position" value={profile?.position} />
            <InfoField label="Company" value={profile?.company_name} />
            <InfoField label="Highest Degree" value={profile?.highest_degree} />
            <InfoField label="Years of Experience" value={profile?.years_of_experience} />
          </>
        )}
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p className="text-sm text-muted-foreground font-medium">Bio</p>
        <p className="text-foreground/90 leading-relaxed">
          {profile?.bio || 'No bio available'}
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">External Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile?.linkedin_url && (
            <a 
              href={profile.linkedin_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors text-center text-primary hover:text-primary/80"
            >
              LinkedIn Profile
            </a>
          )}
          {profile?.github_url && (
            <a 
              href={profile.github_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors text-center text-primary hover:text-primary/80"
            >
              GitHub Profile
            </a>
          )}
          {profile?.website_url && (
            <a 
              href={profile.website_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors text-center text-primary hover:text-primary/80"
            >
              Personal Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}