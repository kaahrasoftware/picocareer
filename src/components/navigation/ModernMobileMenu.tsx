
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface MobileMenuSection {
  title: string;
  items: {
    title: string;
    href: string;
    description?: string;
  }[];
}

interface ModernMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModernMobileMenu({ isOpen, onClose }: ModernMobileMenuProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  let location;
  try {
    location = useLocation();
  } catch (error) {
    location = { pathname: "/" };
  }
  
  const currentPath = location?.pathname || "/";

  const isActive = (path: string) => {
    if (path === "/" && currentPath !== "/") return false;
    return currentPath.startsWith(path);
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  // Career Tools mega menu
  const careerToolsItems = [
    {
      title: "Academic & Career Paths",
      items: [
        { 
          title: "Career Paths", 
          href: "/careers",
          description: "Explore various career opportunities"
        },
        { 
          title: "Academic Majors", 
          href: "/program",
          description: "Discover fields of study and degree programs"
        }
      ]
    },
    {
      title: "Discovery Tools",
      items: [
        { 
          title: "Schools Directory", 
          href: "/school",
          description: "Find colleges and universities"
        },
        { 
          title: "Career Assessment", 
          href: "/career-assessment",
          description: "Take our assessment to find your ideal career"
        }
      ]
    }
  ];

  // Pico Resources mega menu
  const picoResourcesItems = [
    {
      title: "Learning Resources",
      items: [
        { 
          title: "Scholarships", 
          href: "/scholarships",
          description: "Financial aid opportunities"
        },
        { 
          title: "Opportunities", 
          href: "/opportunities",
          description: "Internships and job openings"
        }
      ]
    },
    {
      title: "Community & Content",
      items: [
        { 
          title: "Resource Bank", 
          href: "/resource-bank",
          description: "Educational resources from events"
        },
        { 
          title: "Events", 
          href: "/events",
          description: "Career fairs and workshops"
        }
      ]
    }
  ];

  // Company mega menu
  const companyItems = [
    {
      title: "About PicoCareer",
      items: [
        { 
          title: "About Us", 
          href: "/about",
          description: "Our mission and values"
        },
        { 
          title: "Work with Us", 
          href: "/careers",
          description: "Join our team"
        }
      ]
    }
  ];

  const navItems = [
    { 
      label: "Home", 
      href: "/", 
      type: "link" as const 
    },
    { 
      label: "Career Tools", 
      sections: careerToolsItems, 
      type: "mega" as const 
    },
    { 
      label: "Mentorship", 
      href: "/mentor", 
      type: "link" as const 
    },
    { 
      label: "Partnerships", 
      href: "/partnerships", 
      type: "link" as const 
    },
    { 
      label: "Hubs", 
      href: "/hubs", 
      type: "link" as const 
    },
    { 
      label: "Pico Resources", 
      sections: picoResourcesItems, 
      type: "mega" as const 
    },
    { 
      label: "Company", 
      sections: companyItems, 
      type: "mega" as const 
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={onClose}
      />

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          "fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 z-50",
          "bg-background/95 backdrop-blur-xl border-l border-border/60 shadow-2xl shadow-black/10",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <nav className="flex-1 p-6 space-y-2">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.type === "link" ? (
                  <Link
                    to={item.href!}
                    onClick={onClose}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200",
                      "hover:bg-muted/80 hover:translate-x-1",
                      isActive(item.href!)
                        ? "bg-primary/15 text-primary border-l-2 border-primary"
                        : "text-foreground hover:text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleSection(item.label)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200",
                        "hover:bg-muted/80 text-foreground hover:text-primary",
                        expandedSections.includes(item.label) && "bg-muted/60"
                      )}
                    >
                      {item.label}
                      {expandedSections.includes(item.label) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        expandedSections.includes(item.label) 
                          ? "max-h-96 opacity-100" 
                          : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="pl-4 pt-2 space-y-1">
                        {item.sections?.map((section) => (
                          <div key={section.title} className="space-y-1">
                            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              {section.title}
                            </div>
                            {section.items.map((subItem) => (
                              <Link
                                key={subItem.href}
                                to={subItem.href}
                                onClick={onClose}
                                className={cn(
                                  "block px-4 py-2 rounded-md text-sm transition-all duration-200",
                                  "hover:bg-muted/60 hover:translate-x-1",
                                  isActive(subItem.href)
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                <div className="font-medium">{subItem.title}</div>
                                {subItem.description && (
                                  <div className="text-xs opacity-70 mt-0.5">
                                    {subItem.description}
                                  </div>
                                )}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
