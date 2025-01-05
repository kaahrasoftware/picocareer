import { useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();

  const companyLinks = [
    { label: "About Us", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ];

  const otherLinks = [
    { label: "Blog", href: "/blog", onClick: () => navigate("/blog") },
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
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-sm font-medium mb-2">PicoCareer</h4>
            <ul className="space-y-2">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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