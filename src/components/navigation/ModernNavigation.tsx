
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ModernMegaMenu } from "./ModernMegaMenu";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export function ModernNavigation() {
  const { isAdmin, isLoading } = useIsAdmin();
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

  // Career Guide Tools mega menu
  const careerGuideItems = [
    {
      title: "Academic & Career Paths",
      items: [
        { 
          title: "Academic Programs", 
          href: "/program",
          description: "Explore fields of study and degree programs"
        },
        { 
          title: "Career Paths", 
          href: "/career",
          description: "Discover various career opportunities"
        },
        { 
          title: "Schools", 
          href: "/school",
          description: "Find colleges and universities"
        }
      ]
    }
  ];

  // Resources mega menu
  const resourceItems = [
    {
      title: "Learning Resources",
      items: [
        { 
          title: "Resource Bank", 
          href: "/resource-bank",
          description: "Access educational resources from all events"
        },
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
          title: "Events", 
          href: "/event",
          description: "Career fairs and workshops"
        },
        { 
          title: "Blogs and Guides", 
          href: "/blog",
          description: "Career advice and insights"
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

  // Admin mega menu - only visible to admins
  const adminItems = [
    {
      title: "Content Management",
      items: [
        { 
          title: "Dashboard", 
          href: "/dashboard",
          description: "Admin dashboard and analytics"
        },
        { 
          title: "Career Upload", 
          href: "/career/upload",
          description: "Add new career paths"
        },
        { 
          title: "Event Upload", 
          href: "/event/upload",
          description: "Create new events"
        },
        { 
          title: "Blog Upload", 
          href: "/blog/upload",
          description: "Publish new blog posts"
        },
        { 
          title: "Major Upload", 
          href: "/major/upload",
          description: "Add academic majors"
        },
        { 
          title: "School Upload", 
          href: "/schools/upload",
          description: "Add educational institutions"
        },
        { 
          title: "Company Upload", 
          href: "/companies/upload",
          description: "Add companies to database"
        }
      ]
    },
    {
      title: "Marketing Tools",
      items: [
        { 
          title: "Email Campaigns", 
          href: "/admin/email-campaigns",
          description: "Manage email marketing campaigns"
        },
        { 
          title: "Scholarship Scraper", 
          href: "/admin/email-campaigns?tab=scholarship-scraper",
          description: "Automated scholarship data collection"
        },
        { 
          title: "Scholarships Add", 
          href: "/scholarships/add",
          description: "Add new scholarship opportunities"
        },
        { 
          title: "Opportunities Create", 
          href: "/opportunities/create",
          description: "Create job and internship opportunities"
        }
      ]
    },
    {
      title: "AI & Assessment",
      items: [
        { 
          title: "Career Chat", 
          href: "/career-chat",
          description: "AI-powered career guidance"
        },
        { 
          title: "Personality Test", 
          href: "/personality-test",
          description: "Career personality assessments"
        }
      ]
    },
    {
      title: "Debug Tools",
      items: [
        { 
          title: "Debug Token Deduction", 
          href: "/debug/token-deduction",
          description: "Token system debugging tools"
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
      label: "Career Guide Tools", 
      sections: careerGuideItems, 
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
      label: "Resources", 
      sections: resourceItems, 
      type: "mega" as const 
    },
    { 
      label: "Company", 
      sections: companyItems, 
      type: "mega" as const 
    },
    // Conditionally add Admin menu for admins only
    ...(isAdmin && !isLoading ? [{ 
      label: "Admin", 
      sections: adminItems, 
      type: "mega" as const 
    }] : [])
  ];

  return (
    <nav className="flex items-center justify-center">
      <ul className="flex items-center gap-1">
        {navItems.map((item) => (
          <li key={item.label}>
            {item.type === "link" ? (
              <Link 
                to={item.href!}
                className={cn(
                  "relative px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm",
                  "hover:bg-muted/80 hover:text-primary",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "before:absolute before:inset-x-4 before:bottom-0 before:h-0.5 before:bg-primary before:rounded-full",
                  "before:scale-x-0 before:transition-transform before:duration-200",
                  isActive(item.href!) 
                    ? "text-primary bg-primary/10 before:scale-x-100" 
                    : "text-muted-foreground hover:before:scale-x-100"
                )}
              >
                {item.label}
              </Link>
            ) : (
              <ModernMegaMenu 
                sections={item.sections!} 
                trigger={item.label} 
              />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
