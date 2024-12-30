import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PersonalInfoFieldsProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: {
    firstName?: boolean;
    lastName?: boolean;
    password?: boolean;
  };
}

export function PersonalInfoFields({ 
  firstName, 
  lastName, 
  email, 
  password, 
  onChange,
  hasError 
}: PersonalInfoFieldsProps) {
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isValidPassword = hasLowerCase && hasUpperCase && hasNumber;

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
          value={password}
          onChange={onChange}
          required
          className={hasError?.password ? "border-red-500" : ""}
        />
        <Alert variant={isValidPassword ? "default" : "destructive"} className="mt-2">
          <AlertDescription>
            Password must contain:
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li className={hasLowerCase ? "text-green-500" : ""}>
                At least one lowercase letter (a-z)
              </li>
              <li className={hasUpperCase ? "text-green-500" : ""}>
                At least one uppercase letter (A-Z)
              </li>
              <li className={hasNumber ? "text-green-500" : ""}>
                At least one number (0-9)
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
}