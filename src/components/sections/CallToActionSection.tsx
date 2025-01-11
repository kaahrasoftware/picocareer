import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

export function CallToActionSection() {
  const navigate = useNavigate();
  const { session } = useAuthSession();

  // Always call hooks at the top level before any conditional returns
  const handleGetStarted = () => {
    if (session) {
      navigate("/profile");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-12">
          <h2 className="text-4xl font-bold tracking-tight">
            Discover Your Path to Success
          </h2>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-picocareer-primary hover:bg-picocareer-primary/90"
            >
              Get Started
            </Button>
            <Button
              onClick={() => navigate("/mentor/register")}
              variant="outline"
              size="lg"
            >
              Become a Mentor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}