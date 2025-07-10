import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
export const PartnershipsCTASection = () => {
  return <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-sky-400 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-br from-sky-300 to-blue-400 rounded-full blur-lg"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header with enhanced styling */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-sky-100 px-4 py-2 rounded-full border border-blue-200 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Partnership Opportunity</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-6 leading-tight">
              Partner with PicoCareer
            </h2>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-4 leading-relaxed max-w-3xl mx-auto">
              Transform education with world-class career guidance and mentorship opportunities
            </p>
            
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Join leading institutions and organizations in shaping the future of career development
            </p>
          </div>

          {/* Enhanced CTA with improved design */}
          <div className="relative">
            <Button asChild size="lg" className="group relative bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 hover:from-blue-700 hover:via-blue-800 hover:to-sky-700 text-white font-semibold px-10 py-6 h-auto text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-0 rounded-xl overflow-hidden">
              <Link to="/partnerships" className="flex items-center gap-3 relative z-10">
                <span>Explore Partnership Opportunities</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-600 rounded-xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
          </div>

          {/* Additional features/benefits */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-sky-100 rounded-lg flex items-center justify-center mx-auto mb-3 border border-blue-200">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold text-slate-700 mb-2">Strategic Collaboration</h3>
              <p className="text-sm text-slate-500">Work directly with our team to create customized solutions</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-sky-100 rounded-lg flex items-center justify-center mx-auto mb-3 border border-blue-200">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold text-slate-700 mb-2">Innovation Focus</h3>
              <p className="text-sm text-slate-500">Access cutting-edge career development technologies</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-sky-100 rounded-lg flex items-center justify-center mx-auto mb-3 border border-blue-200">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-semibold text-slate-700 mb-2">Measurable Impact</h3>
              <p className="text-sm text-slate-500">Track and measure success with comprehensive analytics</p>
            </div>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <p className="text-sm mb-4 text-slate-950">Trusted by leading institutions worldwide</p>
            <div className="flex items-center justify-center gap-6 text-slate-300">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                <span className="text-xs text-zinc-500">10+ Partners</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-zinc-500">5K+ Students</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-zinc-500">95% Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};