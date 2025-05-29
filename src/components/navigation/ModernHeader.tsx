
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useBreakpoints } from "@/hooks/useBreakpoints";
import { useMobileMenu } from "@/context/MobileMenuContext";
import { ModernNavigation } from "./ModernNavigation";
import { ModernMobileMenu } from "./ModernMobileMenu";
import { ModernUserSection } from "./ModernUserSection";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

export function ModernHeader() {
  const { isMobile, isTablet, currentBreakpoint } = useBreakpoints();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { session, isError, isLoading } = useAuthSession();

  // Handle scroll effect for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  let location;
  try {
    location = useLocation();
  } catch (error) {
    location = { pathname: "/" };
  }

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location?.pathname]);

  // Responsive logo sizing
  const getLogoSize = () => {
    if (isMobile) return "h-8";
    if (isTablet) return "h-9";
    return "h-10";
  };

  // Dynamic container width
  const getContainerWidth = () => {
    switch (currentBreakpoint) {
      case 'mobile':
        return "px-4";
      case 'tablet':
        return "px-6 max-w-7xl mx-auto";
      case 'desktop':
        return "px-8 max-w-7xl mx-auto";
      case 'large-desktop':
        return "px-12 max-w-8xl mx-auto";
      default:
        return "px-6 max-w-7xl mx-auto";
    }
  };

  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border/40 z-50">
        <div className={cn("h-full flex items-center justify-between", getContainerWidth())}>
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/f2122040-63e7-4f46-8b7c-d7c748d45e28.png" 
              alt="PicoCareer Logo" 
              className={getLogoSize()}
            />
            <span className="text-xl font-semibold text-foreground tracking-tight">PicoCareer</span>
          </Link>
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 ease-in-out",
          isScrolled 
            ? "bg-background/95 backdrop-blur-lg border-b border-border/60 shadow-lg shadow-black/5" 
            : "bg-background/80 backdrop-blur-md border-b border-border/40"
        )}
      >
        <div className={cn("h-full flex items-center justify-between", getContainerWidth())}>
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
          >
            <img 
              src="/lovable-uploads/f2122040-63e7-4f46-8b7c-d7c748d45e28.png" 
              alt="PicoCareer Logo" 
              className={cn(getLogoSize(), "transition-all duration-200")}
            />
            {!isMobile && (
              <span className="text-xl font-semibold text-foreground tracking-tight">
                PicoCareer
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && !isTablet && (
            <div className="flex-1 flex justify-center">
              <ModernNavigation />
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* User Section */}
            <ModernUserSection />

            {/* Mobile/Tablet Menu Toggle */}
            {(isMobile || isTablet) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  "relative w-10 h-10 rounded-lg transition-all duration-200",
                  isMobileMenuOpen 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted"
                )}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <div className="relative w-5 h-5">
                  <Menu 
                    className={cn(
                      "absolute inset-0 w-5 h-5 transition-all duration-200",
                      isMobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                    )} 
                  />
                  <X 
                    className={cn(
                      "absolute inset-0 w-5 h-5 transition-all duration-200",
                      isMobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                    )} 
                  />
                </div>
              </Button>
            )}

            {/* Sign In Button for non-authenticated users */}
            {!session?.user && !isError && (
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Menu */}
      <ModernMobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
}
