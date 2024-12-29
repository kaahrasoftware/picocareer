import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoFieldsProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: {
    firstName?: boolean;
    lastName?: boolean;
    email?: boolean;
  };
  emailError?: string;
}

export function PersonalInfoFields({ 
  firstName, 
  lastName, 
  email, 
  password, 
  onChange,
  hasError,
  emailError
}: PersonalInfoFieldsProps) {
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
            value={firstName}
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
            value={lastName}
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
          value={email}
          onChange={onChange}
          required
          className={emailError ? "border-red-500" : ""}
        />
        {emailError && (
          <p className="text-sm text-red-500 mt-1">{emailError}</p>
        )}
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
          value={password}
          onChange={onChange}
          required
        />
      </div>
    </>
  );
}