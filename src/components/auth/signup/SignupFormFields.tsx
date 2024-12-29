import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignupFormFieldsProps {
  formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SignupFormFields({ formData, onChange }: SignupFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={onChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={onChange}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={onChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">
          Password <span className="text-red-500">*</span>
        </Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={onChange}
          required
        />
      </div>
    </>
  );
}