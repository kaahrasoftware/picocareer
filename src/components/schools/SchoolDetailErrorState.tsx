
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { School, ArrowLeft } from "lucide-react";

export function SchoolDetailErrorState() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center py-16 space-y-4">
        <School className="h-16 w-16 mx-auto text-muted-foreground/60" />
        <h2 className="text-2xl font-bold">School not found</h2>
        <p className="text-muted-foreground">
          We couldn't find the school you're looking for.
        </p>
        <Button asChild>
          <Link to="/school">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schools
          </Link>
        </Button>
      </div>
    </div>
  );
}
