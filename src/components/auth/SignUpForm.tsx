import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SignUpFormProps {
  formData: {
    email: string;
    password: string;
    fullName: string;
    position: string;
    userType: string;
  };
  onFormDataChange: (data: Partial<SignUpFormProps['formData']>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSignInClick: () => void;
}

export function SignUpForm({ formData, onFormDataChange, onSubmit, onSignInClick }: SignUpFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormDataChange({ email: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => onFormDataChange({ password: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => onFormDataChange({ fullName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position/Role</Label>
        <Input
          id="position"
          type="text"
          value={formData.position}
          onChange={(e) => onFormDataChange({ position: e.target.value })}
          placeholder="e.g., Student, Software Engineer, etc."
          required
        />
      </div>

      <div className="space-y-2">
        <Label>User Type</Label>
        <RadioGroup
          value={formData.userType}
          onValueChange={(value) => onFormDataChange({ userType: value })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="student" id="student" />
            <Label htmlFor="student">Student</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mentor" id="mentor" />
            <Label htmlFor="mentor">Mentor</Label>
          </div>
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full">Sign Up</Button>
      
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSignInClick}
          className="text-primary hover:underline"
        >
          Sign In
        </button>
      </p>
    </form>
  );
}