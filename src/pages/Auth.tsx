import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function Auth() {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <div className="w-[40%] bg-[#2A2A2A] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMkEyQTJBIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] p-8 flex flex-col items-center justify-center">
          <div className="max-w-md space-y-8 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src="/lovable-uploads/d815cd5f-d140-4520-87a1-3d7a6c17df4d.png" 
                  alt="PicoCareer Logo" 
                  className="h-16 w-auto animate-float"
                />
              </div>
              <img 
                src="/lovable-uploads/855127b6-c96d-4c87-9a6e-cdf75680afe9.png" 
                alt="PicoCareer Title" 
                className="h-8 w-auto mx-auto"
              />
              <p className="text-lg text-gray-300">
                Your Gateway to Career Success
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Join Our Community</h2>
              <p className="text-gray-300">
                Connect with mentors, explore careers, and shape your future with PicoCareer.
              </p>
            </div>
          </div>
        </div>

        <div className="w-[60%] p-4">
          <div className="flex items-center justify-center min-h-full">
            <Card className="w-full max-w-md p-6 space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Welcome to PicoCareer</h1>
                <p className="text-sm text-muted-foreground">
                  Sign in to your account or create a new one
                </p>
              </div>

              <Tabs defaultValue="signin" className="space-y-4">
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