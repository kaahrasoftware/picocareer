
interface ProfileCardBioProps {
  bio: string;
}

export function ProfileCardBio({ bio }: ProfileCardBioProps) {
  return (
    <div className="w-full mb-4">
      <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>
    </div>
  );
}
