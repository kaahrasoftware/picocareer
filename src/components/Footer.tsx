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
    { label: "Fields of Study", href: "/program", onClick: () => navigate("/program") },
    { label: "Careers", href: "/career", onClick: () => navigate("/career") },
    { label: "Mentors", href: "/mentor", onClick: () => navigate("/mentor") },
    { label: "Blog", href: "/blog", onClick: () => navigate("/blog") },
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
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.067 16.511c-.272.861-.847 1.564-1.488 2.164-.793.659-1.758 1.117-2.853 1.314-.771.097-1.509.097-2.28 0-1.095-.198-2.061-.655-2.854-1.314-.641-.6-1.216-1.303-1.488-2.164-.451-1.002-.451-2.02 0-3.022.272-.861.847-1.564 1.488-2.164.793-.659 1.758-1.117 2.854-1.314.771-.097 1.509-.097 2.28 0 1.095.198 2.061.655 2.854 1.314.641.6 1.216 1.303 1.488 2.164.451 1.002.451 2.02 0 3.022z"/>
      </svg>, 
      href: "https://wa.me/22897476446",
      label: "WhatsApp"
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
        {/* Logo Section - Full width and centered on mobile */}
        <div className="w-full flex justify-center mb-8 md:hidden">
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
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info Section - Hidden on mobile as it's shown above */}
          <div className="hidden md:block space-y-6">
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
          <div className="col-span-2 md:col-span-1">
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
            
            {/* Copyright and Product Info */}
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <p>© {new Date().getFullYear()} PicoCareer. All rights reserved.</p>
              <span className="mx-2">•</span>
              <p>A product of <strong>Kaahra</strong></p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}