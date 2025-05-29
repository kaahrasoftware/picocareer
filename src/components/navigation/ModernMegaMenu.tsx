
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface MegaMenuSection {
  title: string;
  items: {
    title: string;
    href: string;
    description?: string;
  }[];
}

interface ModernMegaMenuProps {
  sections: MegaMenuSection[];
  trigger: string;
}

export function ModernMegaMenu({ sections, trigger }: ModernMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const menuRef = useRef<HTMLDivElement>(null);

  let location;
  try {
    location = useLocation();
  } catch (error) {
    location = { pathname: "/" };
  }
  
  const isActive = (href: string) => {
    if (!location) return false;
    if (href === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(href);
  };

  const hasActiveItem = sections.some(section => 
    section.items.some(item => isActive(item.href))
  );

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(true);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    timeoutRef.current = setTimeout(() => {
      if (!isHovered) {
        setIsOpen(false);
      }
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={cn(
          "relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm",
          "hover:bg-muted/80 hover:text-primary",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          "before:absolute before:inset-x-4 before:bottom-0 before:h-0.5 before:bg-primary before:rounded-full",
          "before:scale-x-0 before:transition-transform before:duration-200",
          hasActiveItem || isOpen
            ? "text-primary bg-primary/10 before:scale-x-100" 
            : "text-muted-foreground hover:before:scale-x-100"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
        <ChevronDown 
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen ? "rotate-180" : "rotate-0"
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      <div
        ref={menuRef}
        className={cn(
          "absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 transition-all duration-200",
          "bg-background/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl shadow-black/10",
          "min-w-[600px] p-6",
          isOpen 
            ? "opacity-100 visible translate-y-0" 
            : "opacity-0 invisible translate-y-2 pointer-events-none"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="grid grid-cols-2 gap-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase opacity-80">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "group block p-3 rounded-lg transition-all duration-200",
                      "hover:bg-muted/60 hover:shadow-md",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "hover:bg-muted/60"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
