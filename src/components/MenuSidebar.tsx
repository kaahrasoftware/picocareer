
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useMobileMenu } from '@/context/MobileMenuContext';

export const MenuSidebar = () => {
  const { session, user, isLoading } = useAuthSession();
  const { isOpen, closeMobileMenu, toggleMobileMenu } = useMobileMenu();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Sheet open={isOpen} onOpenChange={toggleMobileMenu}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4">
          <Link 
            to="/" 
            className="text-lg font-semibold"
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link 
            to="/career" 
            className="text-lg"
            onClick={closeMobileMenu}
          >
            Careers
          </Link>
          <Link 
            to="/program" 
            className="text-lg"
            onClick={closeMobileMenu}
          >
            Programs
          </Link>
          {session ? (
            <Link 
              to="/profile" 
              className="text-lg"
              onClick={closeMobileMenu}
            >
              Profile
            </Link>
          ) : (
            <Link 
              to="/auth" 
              className="text-lg"
              onClick={closeMobileMenu}
            >
              Sign In
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
