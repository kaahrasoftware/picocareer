interface MentorBioProps {
  bio?: string;
}

export function MentorBio({ bio }: MentorBioProps) {
  if (!bio) return null;
  
  return (
    <div className="bg-kahra-darker rounded-lg p-4">
      <h4 className="font-semibold mb-2">About</h4>
      <p className="text-gray-400">{bio}</p>
    </div>
  );
}