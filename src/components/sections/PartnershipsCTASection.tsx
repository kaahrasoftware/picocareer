
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const PartnershipsCTASection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Partner with PicoCareer
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Transform education with world-class career guidance and mentorship opportunities
          </p>
          <Button
            asChild
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-6 h-auto text-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Link to="/partnerships" className="flex items-center gap-2">
              Explore Partnership Opportunities
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
