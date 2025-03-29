
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
import { GuideButton } from "@/components/guide/GuideButton";

export function MainNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    if (path === "/" && currentPath !== "/") return false;
    return currentPath.startsWith(path);
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/program", label: "Fields of Study", className: "whitespace-nowrap" },
    { path: "/career", label: "Careers" },
    { path: "/mentor", label: "Mentors" },
    { path: "/about", label: "About" },
  ];

  const resourceItems = [
    { path: "/personality-test", label: "Personality Test" },
    { path: "/career-chat", label: "AI Career Guide" },
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
                >
                  {label}
                </Link>
              ))}
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(
                "px-4 py-2 rounded-md transition-colors inline-flex items-center gap-1",
                isActive("/personality-test") || isActive("/event") || isActive("/blog") 
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
        
        {/* Add the guide button */}
        <li className={cn(isMobile ? "mt-4" : "ml-4")}>
          <GuideButton />
        </li>
      </ul>
    </nav>
  );
}
