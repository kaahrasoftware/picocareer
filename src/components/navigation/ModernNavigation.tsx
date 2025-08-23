import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ModernMegaMenu } from './ModernMegaMenu';
import { useIsAdmin } from '@/hooks/useIsAdmin';
export function ModernNavigation() {
  let location;
  try {
    location = useLocation();
  } catch (error) {
    location = {
      pathname: "/"
    };
  }
  const currentPath = location?.pathname || "/";
  const {
    isAdmin,
    isLoading
  } = useIsAdmin();
  const isActive = (path: string) => {
    if (path === "/" && currentPath !== "/") return false;
    return currentPath.startsWith(path);
  };

  // Career Tools mega menu
  const careerToolsItems = [{
    title: "Academic & Career Paths",
    items: [{
      title: "Career Paths",
      href: "/career",
      description: "Explore various career opportunities and paths"
    }, {
      title: "Academic Majors",
      href: "/program",
      description: "Discover fields of study and degree programs"
    }]
  }, {
    title: "Discovery Tools",
    items: [{
      title: "Schools Directory",
      href: "/school",
      description: "Find colleges and universities"
    }, {
      title: "Career Assessment",
      href: "/career-assessment",
      description: "Take our assessment to find your ideal career"
    }]
  }];

  // Pico Resources mega menu
  const picoResourcesItems = [{
    title: "Learning Resources",
    items: [{
      title: "Scholarships",
      href: "/scholarships",
      description: "Financial aid opportunities for students"
    }, {
      title: "Opportunities",
      href: "/opportunities",
      description: "Internships and job openings"
    }]
  }, {
    title: "Community & Content",
    items: [{
      title: "Resource Bank",
      href: "/resource-bank",
      description: "Educational resources from events"
    }, {
      title: "Events",
      href: "/events",
      description: "Career fairs and workshops"
    }]
  }];

  // Company mega menu
  const companyItems = [{
    title: "About PicoCareer",
    items: [{
      title: "About Us",
      href: "/about",
      description: "Our mission and values"
    }, {
      title: "Work with Us",
      href: "/careers",
      description: "Join our team and make a difference"
    }]
  }];

  // Admin mega menu - only shown to admin users
  const adminItems = [{
    title: "Content Management",
    items: [{
      title: "Dashboard",
      href: "/dashboard",
      description: "Admin dashboard and analytics"
    }, {
      title: "Career Upload",
      href: "/career-upload",
      description: "Add new career information"
    }, {
      title: "Majors Upload",
      href: "/major-upload",
      description: "Add new academic majors"
    }, {
      title: "Event Upload",
      href: "/event-upload",
      description: "Create and manage events"
    }, {
      title: "School Upload",
      href: "/school-upload",
      description: "Add new schools and universities"
    }, {
      title: "Company Upload",
      href: "/company-upload",
      description: "Add new company information"
    }]
  }, {
    title: "Operations & Tools",
    items: [{
      title: "Scholarship Add",
      href: "/scholarship-add",
      description: "Add new scholarship opportunities"
    }, {
      title: "Opportunities Create",
      href: "/create-opportunity",
      description: "Create job and internship listings"
    }, {
      title: "API Administration",
      href: "/api-admin",
      description: "Manage API organizations, keys, and templates"
    }]
  }];
  return <nav className="flex items-center space-x-8">
      {/* Home Link */}
      <Link to="/" className={cn("relative px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm", "hover:bg-muted/80 hover:text-primary", "focus:outline-none focus:ring-2 focus:ring-primary/50", "before:absolute before:inset-x-4 before:bottom-0 before:h-0.5 before:bg-primary before:rounded-full", "before:scale-x-0 before:transition-transform before:duration-200", isActive("/") ? "text-primary bg-primary/10 before:scale-x-100" : "text-muted-foreground hover:before:scale-x-100")}>
        Home
      </Link>

      {/* Career Tools Mega Menu */}
      <ModernMegaMenu sections={careerToolsItems} trigger="Career Tools" />

      {/* Mentorship Link */}
      <Link to="/mentor" className={cn("relative px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm", "hover:bg-muted/80 hover:text-primary", "focus:outline-none focus:ring-2 focus:ring-primary/50", "before:absolute before:inset-x-4 before:bottom-0 before:h-0.5 before:bg-primary before:rounded-full", "before:scale-x-0 before:transition-transform before:duration-200", isActive("/mentor") ? "text-primary bg-primary/10 before:scale-x-100" : "text-muted-foreground hover:before:scale-x-100")}>
        Mentorship
      </Link>

      {/* Partnerships Link */}
      <Link to="/partnerships" className={cn("relative px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm", "hover:bg-muted/80 hover:text-primary", "focus:outline-none focus:ring-2 focus:ring-primary/50", "before:absolute before:inset-x-4 before:bottom-0 before:h-0.5 before:bg-primary before:rounded-full", "before:scale-x-0 before:transition-transform before:duration-200", isActive("/partnerships") ? "text-primary bg-primary/10 before:scale-x-100" : "text-muted-foreground hover:before:scale-x-100")}>
        Partnerships
      </Link>

      {/* Hubs Link */}
      <Link to="/hubs" className={cn("relative px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm", "hover:bg-muted/80 hover:text-primary", "focus:outline-none focus:ring-2 focus:ring-primary/50", "before:absolute before:inset-x-4 before:bottom-0 before:h-0.5 before:bg-primary before:rounded-full", "before:scale-x-0 before:transition-transform before:duration-200", isActive("/hubs") ? "text-primary bg-primary/10 before:scale-x-100" : "text-muted-foreground hover:before:scale-x-100")}>
        Hubs
      </Link>

      {/* Prizes Link */}
      

      {/* Pico Resources Mega Menu */}
      <ModernMegaMenu sections={picoResourcesItems} trigger="Pico Resources" />

      {/* Admin Mega Menu - Only show to admin users */}
      {!isLoading && isAdmin && <ModernMegaMenu sections={adminItems} trigger="Admin" />}

      {/* Company Mega Menu */}
      <ModernMegaMenu sections={companyItems} trigger="Company" />
    </nav>;
}