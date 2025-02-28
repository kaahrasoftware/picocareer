
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Verification Failed</h2>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">{error}</p>
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p>Possible reasons:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>The invitation link has expired</li>
              <li>The token is not valid</li>
              <li>You are signed in with a different email address</li>
              <li>The invitation has already been processed</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" asChild>
            <Link to="/hubs" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Return to Hubs
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
