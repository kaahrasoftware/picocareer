import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

interface SocialSignInProps {
  onGoogleSignIn: () => Promise<void>;
}

export function SocialSignIn({ onGoogleSignIn }: SocialSignInProps) {
  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={onGoogleSignIn}
      >
        <Icons.google className="mr-2 h-4 w-4" />
        Google
      </Button>
    </>
  );
}