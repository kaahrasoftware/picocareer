
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  const navigate = useNavigate();

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>Invitation Error</CardTitle>
          </div>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate("/hubs")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Hubs
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => window.location.href = "/hub-invite"}
            className="text-sm"
          >
            Try another invitation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
