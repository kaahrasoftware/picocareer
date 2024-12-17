import { Link } from "react-router-dom";

export function MenuSidebar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50">
      <div className="container h-full mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img 
              src="/lovable-uploads/2b1bee0a-4952-41f3-8220-963b51130b04.png" 
              alt="PicoCareer Logo" 
              className="h-10"
            />
          </Link>
        </div>

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
          </ul>
        </nav>
      </div>
    </header>
  );
}