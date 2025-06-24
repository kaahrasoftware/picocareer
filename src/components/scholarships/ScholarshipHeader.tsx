
import { Button } from "@/components/ui/button";
import { Plus, School } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { useUserProfile } from "@/hooks/useUserProfile";

export function ScholarshipHeader() {
  const { user, session } = useAuthState();
  const { data: profile } = useUserProfile(session);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <School className="h-8 w-8 text-blue-500" />
          Scholarships
        </h1>
        <p className="text-muted-foreground mt-1">
          Find financial support opportunities for your education
        </p>
      </div>

      {user && profile?.user_type === 'admin' && (
        <Button asChild>
          <Link to="/scholarships/add">
            <Plus className="h-4 w-4 mr-1" /> Add Scholarship
          </Link>
        </Button>
      )}
    </div>
  );
}
