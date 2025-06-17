
import { Card } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useSearchParams } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function Auth() {
  const { session, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Define the query function outside conditional rendering
  const fetchMentors = async () => {
    try {
      console.log('Fetching mentors...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar_url, first_name, last_name')
        .eq('user_type', 'mentor')
        .limit(10)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) {
        console.log('No mentors found');
        return [];
      }

      console.log('Fetched mentors:', data?.length);
      return data;
    } catch (error) {
      console.error('Error fetching mentors:', error);
      return [];
    }
  };

  // Always define the query regardless of auth state
  const { data: mentors = [], isError } = useQuery({
    queryKey: ['random-mentors'],
    queryFn: fetchMentors,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Show loading state if auth is still loading
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  // Don't render if we have a session (AuthContext will handle redirect)
  if (session?.user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
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
                <Link to="/mentor-registration" className="flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Become a Mentor
                </Link>
              </Button>
              <p className="text-gray-300 text-sm lg:text-base">
                Share your expertise, inspire the next generation, and make a lasting impact as a PicoCareer mentor.
              </p>
              
              {!isError && mentors && mentors.length > 0 && (
                <div className="mt-6 lg:mt-8 flex justify-center items-center">
                  <Carousel
                    opts={{
                      align: "start",
                      loop: true,
                      dragFree: true,
                    }}
                    plugins={[
                      Autoplay({
                        delay: 2000,
                        stopOnInteraction: false,
                      }),
                    ]}
                    className="w-full max-w-xs mx-auto"
                  >
                    <CarouselContent className="-ml-1">
                      {mentors.map((mentor) => (
                        <CarouselItem key={mentor.id} className="basis-1/5 pl-1 flex items-center justify-center">
                          <div className="relative w-10 lg:w-12 h-10 lg:h-12">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-picocareer-primary to-picocareer-secondary" />
                            <div className="absolute inset-[2px] rounded-full bg-background" />
                            <div className="absolute inset-[4px] rounded-full overflow-hidden">
                              <Avatar className="h-full w-full">
                                <AvatarImage 
                                  src={mentor.avatar_url || ''} 
                                  alt={`${mentor.first_name} ${mentor.last_name}`}
                                  className="h-full w-full object-cover"
                                />
                                <AvatarFallback>
                                  {mentor.first_name?.[0]}
                                  {mentor.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              )}
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

              <Tabs defaultValue={tabParam === 'signup' ? 'signup' : 'signin'} className="space-y-4 lg:space-y-6">
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
