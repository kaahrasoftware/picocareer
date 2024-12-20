import { Textarea } from "@/components/ui/textarea";

interface BioSectionProps {
  bio: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function BioSection({ bio, handleInputChange }: BioSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Bio</h3>
      <div>
        <Textarea
          name="bio"
          value={bio}
          onChange={handleInputChange}
          className="mt-1"
          placeholder="Tell us about yourself..."
        />
      </div>
    </div>
  );
}