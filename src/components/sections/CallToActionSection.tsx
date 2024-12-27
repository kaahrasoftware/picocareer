import { Button } from "@/components/ui/button";
import { UserPlus, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export const CallToActionSection = () => {
  return (
    <section className="py-16 relative overflow-hidden rounded-xl mx-4">
      <div className="absolute inset-0 bg-gradient-to-r from-picocareer-dark to-picocareer-primary opacity-90" />
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Join Our Community Today
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
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
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="w-full md:w-auto bg-white hover:bg-gray-100 text-picocareer-dark font-semibold"
          >
            <Link to="/mentor-registration">
              <GraduationCap className="mr-2 h-5 w-5" />
              Become a Mentor
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};