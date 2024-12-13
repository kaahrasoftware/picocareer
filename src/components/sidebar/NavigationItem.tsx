import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavigationItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active: boolean;
  isCollapsed: boolean;
}

export function NavigationItem({ icon: Icon, label, href, active, isCollapsed }: NavigationItemProps) {
  const navigate = useNavigate();
  
  return (
    <li>
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          navigate(href);
        }}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group ${
          active ? 'bg-muted text-foreground' : ''
        }`}
        data-sidebar="menu-button"
      >
        <div className="flex items-center justify-center w-5 min-w-[1.25rem] ml-2">
          <Icon className="w-5 h-5" />
        </div>
        <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
          {label}
        </span>
      </a>
    </li>
  );
}