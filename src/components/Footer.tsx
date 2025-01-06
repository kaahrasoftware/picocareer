import { useNavigate } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

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
    { icon: "tiktok", href: "#" },
    { icon: "youtube", href: "#" },
    { icon: "linkedin", href: "#" },
    { icon: "instagram", href: "#" },
    { icon: "facebook", href: "#" },
  ];

  return (
    <footer className="mt-20 border-t border-border pt-6">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          {/* Company Logo and Contact Info */}
          <div className="mb-6 md:mb-0">
            <div className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/65608658-2c3b-4eab-80f0-d9791cae7b50.png"
                alt="PicoCareer"
                className="h-8 mr-2"
              />
              <h3 className="text-xl font-semibold bg-gradient-to-r from-picocareer-secondary to-picocareer-primary bg-clip-text text-transparent">
                PicoCareer
              </h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <a href="mailto:info@picocareer.com" className="hover:text-foreground transition-colors">
                  info@picocareer.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <a href="tel:+22897476446" className="hover:text-foreground transition-colors">
                  +228 97 47 64 46
                </a>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-medium mb-2">Company</h4>
              <ul className="space-y-2">
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
            <div>
              <h4 className="text-sm font-medium mb-2">Other Links</h4>
              <ul className="space-y-2">
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
          </div>
        </div>

        {/* Social Links */}
        <div className="flex gap-4 mb-6">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <i className={`fab fa-${link.icon} w-5 h-5`}></i>
            </a>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="mb-6">
          <div className="relative max-w-md">
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
    </footer>
  );
}