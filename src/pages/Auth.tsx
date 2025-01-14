import { Card } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function Auth() {
  const { session } = useAuthSession();
  const navigate = useNavigate();

  // Redirect authenticated users away from auth page
  if (session?.user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Section - Dark Background */}
        <div className="w-full lg:w-[40%] bg-[#2A2A2A] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMkEyQTJBIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] p-4 lg:p-8 flex flex-col items-center">
          <div className="h-10 lg:h-20" />
          <div className="flex flex-col items-center space-y-4">
            <Link to="/">
              <img 
                src="/lovable-uploads/5bc14e63-ae18-4b0e-b24f-491ed6206d5c.png" 
                alt="PicoCareer Logo" 
                className="h-12 lg:h-16 w-auto animate-float"
              />
            </Link>
            <Link to="/">
              <img 
                src="/lovable-uploads/90701554-04cf-42e3-9cfd-cce94a7af17a.png" 
                alt="PicoCareer Title" 
                className="h-8 lg:h-12 w-auto mx-auto"
              />
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mt-8 lg:mt-20">
            <div className="space-y-4 lg:space-y-6 text-center w-full px-4">
              <Button 
                asChild
                variant="default"
                size="lg"
                className="w-full max-w-xs bg-picocareer-primary hover:bg-picocareer-accent text-white font-semibold py-4 lg:py-6 text-base lg:text-lg shadow-lg"
              >
                <Link to="/mentor/register" className="flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Become a Mentor
                </Link>
              </Button>
              <p className="text-gray-300 text-sm lg:text-base">
                Share your expertise, inspire the next generation, and make a lasting impact as a PicoCareer mentor.
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Auth Forms */}
        <div className="w-full lg:w-[60%] p-4">
          <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
            <Card className="w-full max-w-md p-4 lg:p-6 space-y-4 lg:space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">Welcome to PicoCareer</h1>
                <p className="text-sm text-muted-foreground">
                  Connect with mentors, find your dream school, and career
                </p>
              </div>

              <Tabs defaultValue="signin" className="space-y-4 lg:space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <SignInForm />
                </TabsContent>
                <TabsContent value="signup">
                  <SignUpForm />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}