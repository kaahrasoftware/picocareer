
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMobileMenu } from "@/context/MobileMenuContext";
import { MegaMenu } from "./MegaMenu";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export function MainNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  const { closeMobileMenu } = useMobileMenu();
  const { isAdmin, isLoading } = useIsAdmin();

  const isActive = (path: string) => {
    if (path === "/" && currentPath !== "/") return false;
    return currentPath.startsWith(path);
  };

  const handleNavigation = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMobile) {
      closeMobileMenu();
    }
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

  if (isMobile) {
    return (
      <nav className="flex flex-col space-y-2">
        <Link 
          to="/" 
          className={cn(
            "px-4 py-2 rounded-md transition-colors",
            isActive("/") && "bg-primary/20 text-primary"
          )}
          onClick={handleNavigation}
        >
          Home
        </Link>
        
        <MegaMenu sections={careerGuideItems} trigger="Career Guide Tools" />
        
        <Link 
          to="/mentor" 
          className={cn(
            "px-4 py-2 rounded-md transition-colors",
            isActive("/mentor") && "bg-primary/20 text-primary"
          )}
          onClick={handleNavigation}
        >
          Mentorship
        </Link>
        
        <Link 
          to="/mentees" 
          className={cn(
            "px-4 py-2 rounded-md transition-colors",
            isActive("/mentees") && "bg-primary/20 text-primary"
          )}
          onClick={handleNavigation}
        >
          Mentees
        </Link>
        
        <Link 
          to="/partnerships" 
          className={cn(
            "px-4 py-2 rounded-md transition-colors",
            isActive("/partnerships") && "bg-primary/20 text-primary"
          )}
          onClick={handleNavigation}
        >
          Partnerships
        </Link>
        
        <Link 
          to="/hubs" 
          className={cn(
            "px-4 py-2 rounded-md transition-colors",
            isActive("/hubs") && "bg-primary/20 text-primary"
          )}
          onClick={handleNavigation}
        >
          Hubs
        </Link>
        
        <MegaMenu sections={resourceItems} trigger="Resources" />
        
        <MegaMenu sections={companyItems} trigger="Company" />
        
        {isAdmin && !isLoading && (
          <MegaMenu sections={adminItems} trigger="Admin" />
        )}
      </nav>
    );
  }

  return (
    <nav className="flex justify-center w-full">
      <ul className="flex gap-8 justify-center max-w-6xl mx-auto items-center">
        <li>
          <Link 
            to="/" 
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              isActive("/") && "bg-primary/20 text-primary"
            )}
            onClick={handleNavigation}
          >
            Home
          </Link>
        </li>
        
        <li>
          <MegaMenu sections={careerGuideItems} trigger="Career Guide Tools" />
        </li>
        
        <li>
          <Link 
            to="/mentor" 
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              isActive("/mentor") && "bg-primary/20 text-primary"
            )}
            onClick={handleNavigation}
          >
            Mentorship
          </Link>
        </li>
        
        <li>
          <Link 
            to="/mentees" 
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              isActive("/mentees") && "bg-primary/20 text-primary"
            )}
            onClick={handleNavigation}
          >
            Mentees
          </Link>
        </li>
        
        <li>
          <Link 
            to="/partnerships" 
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              isActive("/partnerships") && "bg-primary/20 text-primary"
            )}
            onClick={handleNavigation}
          >
            Partnerships
          </Link>
        </li>
        
        <li>
          <Link 
            to="/hubs" 
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              isActive("/hubs") && "bg-primary/20 text-primary"
            )}
            onClick={handleNavigation}
          >
            Hubs
          </Link>
        </li>
        
        <li>
          <MegaMenu sections={resourceItems} trigger="Resources" />
        </li>
        
        <li>
          <MegaMenu sections={companyItems} trigger="Company" />
        </li>
        
        {isAdmin && !isLoading && (
          <li>
            <MegaMenu sections={adminItems} trigger="Admin" />
          </li>
        )}
      </ul>
    </nav>
  );
}
