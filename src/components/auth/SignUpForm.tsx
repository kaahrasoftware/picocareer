import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignUpFormProps {
  formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
  onFormDataChange: (data: Partial<SignUpFormProps['formData']>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSignInClick: () => void;
}

export function SignUpForm({ formData, onFormDataChange, onSubmit, onSignInClick }: SignUpFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          type="text"
          value={formData.firstName}
          onChange={(e) => onFormDataChange({ firstName: e.target.value })}
          required
          placeholder="Enter your first name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          type="text"
          value={formData.lastName}
          onChange={(e) => onFormDataChange({ lastName: e.target.value })}
          required
          placeholder="Enter your last name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormDataChange({ email: e.target.value })}
          required
          placeholder="Enter your email"
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
          placeholder="Create a password"
        />
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