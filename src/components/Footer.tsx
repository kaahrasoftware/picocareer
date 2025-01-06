import { useNavigate } from "react-router-dom";
import { Mail, Phone, Facebook, Instagram, Linkedin, Youtube, Twitter } from "lucide-react";

export function Footer() {
  const navigate = useNavigate();

  const companyLinks = [
    { label: "About Us", href: "/about", onClick: () => navigate("/about") },
    { label: "Contact Us", href: "/contact", onClick: () => navigate("/contact") },
    { label: "Privacy Policy", href: "/privacy", onClick: () => navigate("/privacy") },
    { label: "Terms of Service", href: "/terms", onClick: () => navigate("/terms") },
  ];

  const otherLinks = [
    { label: "Blog", href: "/blog", onClick: () => navigate("/blog") },
    { label: "Schools", href: "/school", onClick: () => navigate("/school") },
    { label: "Funding", href: "/funding", onClick: () => navigate("/funding") },
    { label: "How PicoCareer works", href: "#" },
  ];

  const socialLinks = [
    { 
      icon: <Instagram className="w-5 h-5" />, 
      href: "https://instagram.com/picocareer",
      label: "Instagram"
    },
    { 
      icon: <Facebook className="w-5 h-5" />, 
      href: "https://facebook.com/picocareer",
      label: "Facebook"
    },
    { 
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.12v-3.46a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 16a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.33c.98.69 2.15 1.1 3.41 1.1v-3.44a4.85 4.85 0 0 1-1.5.7Z"/>
      </svg>, 
      href: "https://tiktok.com/@picocareer",
      label: "TikTok"
    },
    { 
      icon: <Linkedin className="w-5 h-5" />, 
      href: "https://linkedin.com/company/picocareer",
      label: "LinkedIn"
    },
    { 
      icon: <Twitter className="w-5 h-5" />, 
      href: "https://twitter.com/picocareer",
      label: "X (Twitter)"
    },
    { 
      icon: <Youtube className="w-5 h-5" />, 
      href: "https://youtube.com/@picocareer",
      label: "YouTube"
    }
  ];

  return (
    <footer className="mt-20 border-t border-border bg-white">
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/d6b217eb-2cec-4933-b8ee-09a438e5d28d.png"
                alt="PicoCareer Logo"
                className="h-12 w-12 object-contain"
              />
              <img 
                src="/lovable-uploads/facac3f6-d693-4d3f-a971-a6aa734c804e.png"
                alt="PicoCareer"
                className="h-8"
              />
            </div>
            <div className="space-y-3">
              <a href="mailto:info@picocareer.com" 
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4 mr-2" />
                info@picocareer.com
              </a>
              <a href="tel:+22897476446" 
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4 mr-2" />
                +228 97 47 64 46
              </a>
            </div>
          </div>

          {/* Company Links Section */}
          <div>
            <h4 className="font-semibold text-base mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={link.onClick}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Other Links Section */}
          <div>
            <h4 className="font-semibold text-base mb-4">Resources</h4>
            <ul className="space-y-3">
              {otherLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    onClick={link.onClick}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h4 className="font-semibold text-base mb-4">Stay Updated</h4>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Subscribe to our newsletter for the latest updates and opportunities.
              </p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Social Links */}
            <div className="flex gap-6">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
            
            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PicoCareer. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}