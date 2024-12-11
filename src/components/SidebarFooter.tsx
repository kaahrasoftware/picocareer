import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function SidebarFooter() {
  return (
    <div className="mt-auto p-6 border-t border-border">
      <Button 
        variant="ghost" 
        className="w-full justify-start text-primary hover:text-primary/90 hover:bg-primary/10"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Login
      </Button>
    </div>
  );
}