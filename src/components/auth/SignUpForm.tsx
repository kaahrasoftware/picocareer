import { Button } from "@/components/ui/button";
import { SignupFormFields } from "./signup/SignupFormFields";
import { SocialSignIn } from "./signup/SocialSignIn";
import { useSignupForm } from "./signup/useSignupForm";

export function SignUpForm() {
  const { formData, isLoading, handleInputChange, handleSignUp } = useSignupForm();

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <SignupFormFields
        formData={formData}
        onChange={handleInputChange}
      />
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>

      <SocialSignIn />
    </form>
  );
}