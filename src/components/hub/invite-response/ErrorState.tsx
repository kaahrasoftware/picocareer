
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl py-8">
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => navigate("/hubs")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Hubs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
