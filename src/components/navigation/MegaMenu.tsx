
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface MegaMenuSection {
  title: string;
  items: {
    title: string;
    href: string;
    description?: string;
  }[];
}

interface MegaMenuProps {
  sections: MegaMenuSection[];
  trigger: string;
}

export function MegaMenu({ sections, trigger }: MegaMenuProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (href: string) => {
    if (href === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(href);
  };

  const hasActiveItem = sections.some(section => 
    section.items.some(item => isActive(item.href))
  );

  if (isMobile) {
    return (
      <div className="space-y-2">
        <div className="font-medium text-gray-900 px-4 py-2">
          {trigger}
        </div>
        {sections.map((section) => (
          <div key={section.title} className="pl-4 space-y-1">
            <div className="text-sm font-medium text-gray-600 px-4 py-1">
              {section.title}
            </div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "block px-4 py-2 text-sm rounded-md transition-colors",
                  isActive(item.href)
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger 
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              hasActiveItem && "bg-primary/20 text-primary"
            )}
          >
            {trigger}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[600px] gap-6 p-6 grid-cols-2">
              {sections.map((section) => (
                <div key={section.title} className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "block p-2 rounded-md transition-colors group",
                          isActive(item.href)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-gray-50"
                        )}
                      >
                        <div className="font-medium text-sm group-hover:text-primary">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-600 mt-1">
                            {item.description}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
