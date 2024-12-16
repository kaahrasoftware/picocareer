import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    position: "",
    userType: "student"
  });
  const lastCheckRef = React.useRef<number>(0);
  const CHECK_INTERVAL = 600000; // 10 minutes interval
  const DEBOUNCE_DELAY = 5000; // 5 seconds debounce

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          position: formData.position,
          user_type: formData.userType
        }
      }
    });

    if (error) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Please check your email to verify your account.",
      });
      onOpenChange(false);
    }
  };

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isComponentMounted = true;
    
    const checkSession = async () => {
      const now = Date.now();
      if (!isComponentMounted || isRefreshing || now - lastCheckRef.current < CHECK_INTERVAL) {
        return;
      }

      try {
        setIsRefreshing(true);
        lastCheckRef.current = now;
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check failed:', error);
          return;
        }
        
        if (session && isComponentMounted) {
          onOpenChange(false);
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
          if (isComponentMounted) {
            setIsRefreshing(false);
          }
        }, DEBOUNCE_DELAY);
      }
    };

    const handleAuthChange = (event: string, session: any) => {
      if (!isComponentMounted) return;

      if (event === 'SIGNED_IN') {
        onOpenChange(false);
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    const initialCheckTimeout = setTimeout(checkSession, 5000);
    const intervalId = setInterval(checkSession, CHECK_INTERVAL);

    return () => {
      isComponentMounted = false;
      if (subscription) subscription.unsubscribe();
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      clearTimeout(initialCheckTimeout);
    };
  }, [onOpenChange, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <div className="flex flex-col items-center gap-4 py-4">
          <img
            src="/lovable-uploads/6acdf1f4-1127-4008-b833-3b68780f1741.png"
            alt="Logo"
            className="w-12 h-12"
          />
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-muted-foreground text-center">
            {isSignUp ? "Create your account" : "Sign in to continue your journey"}
          </p>
        </div>

        {isSignUp ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position/Role</Label>
              <Input
                id="position"
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., Student, Software Engineer, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>User Type</Label>
              <RadioGroup
                value={formData.userType}
                onValueChange={(value) => setFormData({ ...formData, userType: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mentor" id="mentor" />
                  <Label htmlFor="mentor">Mentor</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full">Sign Up</Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-primary hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        ) : (
          <>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'rgb(14, 165, 233)',
                      brandAccent: 'rgb(0, 35, 102)',
                    },
                  },
                },
              }}
              providers={[]}
            />
            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-primary hover:underline"
              >
                Sign Up
              </button>
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}