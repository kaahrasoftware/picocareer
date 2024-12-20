import { Input } from "@/components/ui/input";

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
          <label className="text-sm font-medium">First Name</label>
          <Input
            name="first_name"
            value={firstName}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="Your first name"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <Input
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