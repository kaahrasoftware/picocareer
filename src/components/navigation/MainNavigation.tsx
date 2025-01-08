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
    { path: "/program", label: "Fields of Study" },
    { path: "/career", label: "Careers" },
    { path: "/mentor", label: "Mentors" },
    { path: "/blog", label: "Blog" },
    { path: "/about", label: "About" },
  ];

  return (
    <nav className={cn(
      "flex",
      isMobile ? "flex-col w-full" : "flex-1 justify-center"
    )}>
      <ul className={cn(
        "flex gap-8",
        isMobile ? "flex-col w-full gap-2" : "items-center"
      )}>
        {navItems.map(({ path, label }) => (
          <li key={path} className={isMobile ? "w-full" : undefined}>
            <Link 
              to={path} 
              className={cn(
                "px-4 py-2 rounded-md transition-colors block",
                isMobile ? "w-full" : "",
                isActive(path) && "bg-primary/20 text-primary"
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