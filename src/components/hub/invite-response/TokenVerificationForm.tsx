
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Info } from "lucide-react";

export function TokenVerificationForm() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Hub Invitations</CardTitle>
          <CardDescription>
            View and respond to your hub invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p>
                Your hub invitations are now accessible directly from your notifications panel. 
                We've simplified the process so you no longer need to enter verification tokens.
              </p>
              <p className="mt-2">
                Check your email and notification panel for pending invitations.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <Link to="/hubs" className="text-sm text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Return to Hubs
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
