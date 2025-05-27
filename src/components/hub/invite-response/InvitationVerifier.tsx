
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function InvitationVerifier() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Since hub invitations are not implemented, redirect to hubs page
    setIsVerifying(false);
    setError("Hub invitations are not available at this time.");
    
    setTimeout(() => {
      navigate('/hubs');
    }, 3000);
  }, [location, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mt-4 text-muted-foreground">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invitation Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to hubs page...</p>
        </div>
      </div>
    );
  }

  return null;
}
