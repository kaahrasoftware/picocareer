
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMobileMenu } from "@/context/MobileMenuContext";
import { MegaMenu } from "./MegaMenu";

export function MainNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  const { closeMobileMenu } = useMobileMenu();

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
          href: "/careers", // Placeholder - will be created later
          description: "Join our team"
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
      </ul>
    </nav>
  );
}
