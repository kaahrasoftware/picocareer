import { LucideIcon } from "lucide-react";
import { useLocation } from "react-router-dom";

interface NavigationItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isCollapsed: boolean;
}

export function NavigationItem({ icon: Icon, label, href, isCollapsed }: NavigationItemProps) {
  const location = useLocation();
  const isActive = location.pathname === href;
  
  return (
    <li>
      <a
        href={href}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group ${
          isActive ? 'bg-muted text-foreground' : ''
        }`}
        data-sidebar="menu-button"
      >
        <div className={`flex items-center justify-center w-5 min-w-[1.25rem] ${isCollapsed ? 'mx-auto' : 'ml-3'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
          {label}
        </span>
      </a>
    </li>
  );
}