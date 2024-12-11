import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { AuthDialog } from "./AuthDialog";

export function SidebarFooter() {
  const session = useSession();
  const [authOpen, setAuthOpen] = useState(false);

  if (session) {
    return null;
  }

  return (
    <>
      <div className="mt-auto p-6 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-primary hover:text-primary/90 hover:bg-primary/10"
          onClick={() => setAuthOpen(true)}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </Button>
      </div>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}