import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function EmailConfirmationPending() {
  const location = useLocation();
  const email = location.state?.email || "your email";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="text-muted-foreground">
          We've sent a confirmation link to <strong>{email}</strong>. Please check your email and click the link to activate your account.
        </p>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            The confirmation link will expire in 24 hours. If you don't see the email, check your spam folder.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/auth">
              Return to Sign In
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}