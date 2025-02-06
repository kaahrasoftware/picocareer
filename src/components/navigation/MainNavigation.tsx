
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
    { path: "/personality-test", label: "Personality Test" },
    { path: "/event", label: "Events" },
    { path: "/blog", label: "Blog" },
    { path: "/about", label: "About" },
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
      </ul>
    </nav>
  );
}
