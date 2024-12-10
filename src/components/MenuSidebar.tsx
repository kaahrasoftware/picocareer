import { Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, GraduationCap, Users, RefreshCw, Search, Building2, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MenuSidebar() {
  const navigationItems = [
    { icon: Home, label: "Home", href: "#", active: true },
    { icon: GraduationCap, label: "Featured Careers", href: "#" },
    { icon: GraduationCap, label: "Featured Majors", href: "#" },
    { icon: Users, label: "Top Rated Mentors", href: "#" },
    { icon: RefreshCw, label: "Career Switch", href: "#" },
    { icon: Search, label: "Most Searched Majors", href: "#" },
    { icon: Building2, label: "Top Universities in Bus...", href: "#" },
    { icon: Plus, label: "", href: "#" },
  ];

  const companyLinks = [
    { label: "About Us", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ];

  const otherLinks = [
    { label: "Blog", href: "#" },
    { label: "How Kahra works", href: "#" },
  ];

  const socialLinks = [
    { icon: "tiktok", href: "#" },
    { icon: "youtube", href: "#" },
    { icon: "linkedin", href: "#" },
    { icon: "instagram", href: "#" },
    { icon: "facebook", href: "#" },
  ];

  return (
    <Sidebar side="left">
      <div className="flex flex-col h-full bg-kahra-darker">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <img src="/lovable-uploads/6acdf1f4-1127-4008-b833-3b68780f1741.png" alt="Logo" className="w-6 h-6" />
              <h2 className="text-xl font-bold text-white">Explore</h2>
            </div>
            <SidebarTrigger className="text-gray-400 hover:text-white transition-colors" />
          </div>
          
          <nav className="flex-1 mb-8">
            <ul className="space-y-4">
              {navigationItems.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-kahra-dark/50 transition-colors ${
                      item.active ? 'bg-kahra-dark text-white' : ''
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile and Logout */}
          <div className="mt-auto mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <img src="/placeholder.svg" alt="User" className="w-8 h-8 rounded-full" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white">John Doe</h3>
                <p className="text-xs text-gray-400">Student</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Footer Links */}
          <div className="border-t border-kahra-dark/50 pt-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Company</h4>
                <ul className="space-y-2">
                  {companyLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Other Links</h4>
                <ul className="space-y-2">
                  {otherLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mb-6">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <i className={`fab fa-${link.icon} w-5 h-5`}></i>
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-kahra-dark rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}