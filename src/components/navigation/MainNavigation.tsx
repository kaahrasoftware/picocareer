import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function MainNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/" && currentPath !== "/") return false;
    return currentPath.startsWith(path);
  };

  return (
    <nav className="flex-1 flex justify-center">
      <ul className="flex items-center gap-8">
        <li>
          <Link 
            to="/" 
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              isActive("/") && "bg-primary/20 text-primary"
            )}
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            to="/program" 
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              isActive("/program") && "bg-primary/20 text-primary"
            )}
          >
            Programs
          </Link>
        </li>
        <li>
          <Link 
            to="/career" 
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              isActive("/career") && "bg-primary/20 text-primary"
            )}
          >
            Careers
          </Link>
        </li>
        <li>
          <Link 
            to="/mentor" 
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              isActive("/mentor") && "bg-primary/20 text-primary"
            )}
          >
            Mentors
          </Link>
        </li>
        <li>
          <Link 
            to="/blog" 
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              isActive("/blog") && "bg-primary/20 text-primary"
            )}
          >
            Blog
          </Link>
        </li>
        <li>
          <Link 
            to="/about" 
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              isActive("/about") && "bg-primary/20 text-primary"
            )}
          >
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
}