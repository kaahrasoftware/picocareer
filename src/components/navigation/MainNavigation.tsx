import { Link } from "react-router-dom";

export function MainNavigation() {
  return (
    <nav className="flex-1 flex justify-center">
      <ul className="flex gap-8">
        <li>
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            to="/career" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Careers
          </Link>
        </li>
        <li>
          <Link 
            to="/program" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Programs
          </Link>
        </li>
        <li>
          <Link 
            to="/mentor" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Find a Mentor
          </Link>
        </li>
        <li>
          <Link 
            to="/blog" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Blog
          </Link>
        </li>
        <li>
          <Link 
            to="/video" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Videos
          </Link>
        </li>
      </ul>
    </nav>
  );
}