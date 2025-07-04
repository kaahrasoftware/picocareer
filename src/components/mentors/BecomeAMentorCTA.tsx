
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Star, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export function BecomeAMentorCTA() {
  return (
    <Card className="mb-12 border-0 bg-gradient-to-r from-[#00A6D4]/5 to-[#33b3d9]/5 p-8 lg:p-12">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-[#00A6D4]/10 text-[#00A6D4] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            Share Your Expertise
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Become a Mentor & Make Impact
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl">
            Join our community of industry experts helping the next generation of professionals. 
            Share your knowledge, build your personal brand, and earn while making a difference.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00A6D4]/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-[#00A6D4]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Connect Globally</p>
                <p className="text-sm text-gray-600">Mentor students worldwide</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#33b3d9]/10 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-[#33b3d9]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Build Your Brand</p>
                <p className="text-sm text-gray-600">Establish thought leadership</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0095c1]/10 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#0095c1]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Flexible Schedule</p>
                <p className="text-sm text-gray-600">Mentor on your terms</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:flex-shrink-0">
          <Button 
            asChild 
            size="lg"
            className="bg-gradient-to-r from-[#00A6D4] to-[#0095c1] hover:from-[#0095c1] hover:to-[#008bb5] text-white font-semibold px-8 py-6 h-auto text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group"
          >
            <Link to="/mentor-registration" className="flex items-center gap-2">
              Become a Mentor
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
