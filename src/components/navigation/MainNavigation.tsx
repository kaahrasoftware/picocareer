
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { NotificationPanel } from "./NotificationPanel";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Menu, X } from "lucide-react";

export function MainNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { session } = useAuthSession();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/career", label: "Careers" },
    { href: "/program", label: "Programs" },
    { href: "/mentor", label: "Mentors" },
    { href: "/opportunities", label: "Opportunities" },
    { href: "/partnerships", label: "Partnerships" },
    { href: "/about", label: "About" }
  ];

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              PicoCareer
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`transition-colors hover:text-foreground/80 ${
                  isActiveRoute(item.href) ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              PicoCareer
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other components can go here */}
          </div>
          <nav className="flex items-center space-x-2">
            {session && <NotificationPanel />}
            {session ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 pb-3 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`block px-3 py-2 text-base font-medium ${
                  isActiveRoute(item.href)
                    ? "text-foreground bg-accent"
                    : "text-foreground/60 hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
