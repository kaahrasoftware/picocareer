interface ProfileBioProps {
  bio: string | null;
}

export function ProfileBio({ bio }: ProfileBioProps) {
  if (!bio) return null;

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-2">About</h4>
      <p className="text-muted-foreground">{bio}</p>
    </div>
  );
}