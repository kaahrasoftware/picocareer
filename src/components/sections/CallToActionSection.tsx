import { Button } from "@/components/ui/button";

export const CallToActionSection = () => {
  return (
    <section className="mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">Join Our Community</h2>
        <p className="text-muted-foreground">Connect with mentors and peers to accelerate your career journey.</p>
      </div>
      
      <div className="flex justify-center">
        <Button className="bg-primary text-white">Get Started</Button>
      </div>
    </section>
  );
};
