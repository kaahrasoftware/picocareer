import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoSectionProps {
  firstName: string;
  lastName: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PersonalInfoSection({ firstName, lastName, handleInputChange }: PersonalInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            name="first_name"
            value={firstName}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="Your first name"
          />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            value={lastName}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="Your last name"
          />
        </div>
      </div>
    </div>
  );
}