import { Button } from "@/components/ui/button";
import { UserPlus, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

export const CallToActionSection = () => {
  const { session } = useAuthSession();

  return (
    <>
      <h2 className="text-3xl font-bold text-center mb-8">
        Join Our Community Today
      </h2>
      <section className="py-16 relative overflow-hidden rounded-xl mx-4">
        <div className="absolute inset-0 bg-gradient-to-r from-picocareer-dark to-picocareer-primary opacity-90" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center gap-8">
            {/* Video Container */}
            <div className="w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-xl bg-black/20 p-4">
              <div className="relative aspect-video">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/-1Oltidy_ig?si=eiVCW9HVff4XZi9x&amp;clip=Ugkx5kP_YoFTbF8OVJcrt5xp8bROXl6rx8bK&amp;clipt=EJO-ARjq0wM" 
                  title="YouTube video player" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {!session?.user && (
                <Button
                  asChild
                  size="lg"
                  className="w-full md:w-auto bg-picocareer-primary hover:bg-picocareer-accent text-white font-semibold"
                >
                  <Link to="/auth">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up
                  </Link>
                </Button>
              )}
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full md:w-auto bg-white hover:bg-gray-100 text-picocareer-dark font-semibold"
              >
                <Link to="/mentor/register" className="flex items-center justify-center gap-2">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Become a Mentor
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};