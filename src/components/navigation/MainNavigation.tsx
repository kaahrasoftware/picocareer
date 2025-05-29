
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useMobileMenu } from "@/context/MobileMenuContext";

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
      // Only close the mobile menu in mobile mode
      closeMobileMenu();
    }
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/program", label: "Fields of Study", className: "whitespace-nowrap" },
    { path: "/career", label: "Careers" },
    { path: "/mentor", label: "Mentors" },
    { path: "/about", label: "About" },
  ];

  const resourceItems = [
    // Removed "/career-chat" entry
    { path: "/scholarships", label: "Scholarships" },
    { path: "/opportunities", label: "Opportunities" },
    { path: "/event", label: "Events" },
    { path: "/blog", label: "Blog" },
  ];

  return (
    <nav className="flex justify-center w-full">
      <ul className={cn(
        "flex max-w-3xl mx-auto",
        isMobile ? "flex-col gap-2" : "gap-8 justify-center"
      )}>
        {navItems.map(({ path, label, className }) => (
          <li key={path}>
            <Link 
              to={path} 
              className={cn(
                "px-4 py-2 rounded-md transition-colors block",
                isMobile ? "w-full" : "",
                isActive(path) && "bg-primary/20 text-primary",
                className
              )}
              onClick={handleNavigation}
            >
              {label}
            </Link>
          </li>
        ))}
        <li>
          {isMobile ? (
            <>
              {resourceItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "px-4 py-2 rounded-md transition-colors block w-full",
                    isActive(path) && "bg-primary/20 text-primary"
                  )}
                  onClick={handleNavigation}
                >
                  {label}
                </Link>
              ))}
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(
                "px-4 py-2 rounded-md transition-colors inline-flex items-center gap-1",
                isActive("/career-chat") || isActive("/event") || isActive("/blog") || isActive("/scholarships") || isActive("/opportunities")
                  ? "bg-primary/20 text-primary" 
                  : ""
              )}>
                Resources <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {resourceItems.map(({ path, label }) => (
                  <DropdownMenuItem key={path} asChild>
                    <Link 
                      to={path}
                      className={cn(
                        "w-full",
                        isActive(path) && "bg-primary/20 text-primary"
                      )}
                    >
                      {label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </li>
      </ul>
    </nav>
  );
}
