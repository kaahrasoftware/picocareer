import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";

export default function Auth() {
  return (
    <div className="min-h-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="flex items-center justify-center min-h-screen p-4">
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
        </ResizablePanel>
        
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="flex items-center justify-center min-h-screen p-4 bg-muted/30">
            <div className="max-w-md space-y-4 text-center">
              <h2 className="text-xl font-semibold">Join Our Community</h2>
              <p className="text-muted-foreground">
                Connect with mentors, explore careers, and shape your future with PicoCareer.
              </p>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}