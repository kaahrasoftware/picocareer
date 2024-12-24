import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function Auth() {
  const { data: mentors } = useQuery({
    queryKey: ['random-mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar_url, first_name, last_name')
        .eq('user_type', 'mentor')
        .limit(10)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <div className="w-[40%] bg-[#2A2A2A] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMkEyQTJBIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] p-8 flex flex-col items-center">
          <div className="flex flex-col items-center space-y-4 mb-8">
            <img 
              src="/lovable-uploads/5bc14e63-ae18-4b0e-b24f-491ed6206d5c.png" 
              alt="PicoCareer Logo" 
              className="h-16 w-auto animate-float"
            />
            <img 
              src="/lovable-uploads/90701554-04cf-42e3-9cfd-cce94a7af17a.png" 
              alt="PicoCareer Title" 
              className="h-12 w-auto mx-auto"
            />
          </div>
          
          <div className="max-w-md space-y-8 text-center mt-auto">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Become a Mentor</h2>
              <p className="text-gray-300">
                Share your expertise, inspire the next generation, and make a lasting impact as a PicoCareer mentor.
              </p>
              
              {/* Mentor Carousel */}
              <div className="mt-8 flex justify-center items-center">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                    dragFree: true,
                  }}
                  plugins={[
                    Autoplay({
                      delay: 2000,
                    }),
                  ]}
                  className="w-full max-w-xs mx-auto"
                >
                  <CarouselContent className="-ml-1">
                    {mentors?.map((mentor) => (
                      <CarouselItem key={mentor.id} className="basis-1/5 pl-1 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute -inset-2 rounded-full bg-blue-500/40 blur-lg" />
                          <Avatar className="w-8 h-8 relative border border-white/20">
                            <AvatarImage src={mentor.avatar_url || ''} alt="Mentor" />
                            <AvatarFallback>
                              {mentor.first_name?.[0]}
                              {mentor.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[60%] p-4">
          <div className="flex items-center justify-center min-h-full">
            <Card className="w-full max-w-md p-6 space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Welcome to PicoCareer</h1>
                <p className="text-sm text-muted-foreground">
                  Connect with mentors, find your dream school, and career
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