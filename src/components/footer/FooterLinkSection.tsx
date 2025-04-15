
import { useNavigate } from "react-router-dom";

interface FooterLink {
  label: string;
  href: string;
  onClick: () => void;
}

interface FooterLinkSectionProps {
  title: string;
  links: FooterLink[];
}

export function FooterLinkSection({ title, links }: FooterLinkSectionProps) {
  return (
    <div>
      <h4 className="font-semibold text-base border-b pb-2 border-muted">{title}</h4>
      <ul className="mt-4 space-y-3">
        {links.map((link, index) => (
          <li key={index}>
            <a
              href={link.href}
              onClick={link.onClick}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function useFooterLinks() {
  const navigate = useNavigate();
  
  // Quick Links - Resources, Company, Legal
  const companyLinks = [
    { label: "About Us", href: "/about", onClick: () => navigate("/about") },
    { label: "Contact Us", href: "/contact", onClick: () => navigate("/contact") },
    { label: "Our Team", href: "/about#team", onClick: () => navigate("/about#team") },
    { label: "Careers at PicoCareer", href: "/careers", onClick: () => navigate("/careers") },
  ];

  const resourceLinks = [
    { label: "Fields of Study", href: "/program", onClick: () => navigate("/program") },
    { label: "Career Paths", href: "/career", onClick: () => navigate("/career") },
    { label: "Find a Mentor", href: "/mentor", onClick: () => navigate("/mentor") },
    { label: "Scholarships", href: "/scholarships", onClick: () => navigate("/scholarships") },
    { label: "Learning Resources", href: "/resources", onClick: () => navigate("/resources") },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy", onClick: () => navigate("/privacy") },
    { label: "Terms of Service", href: "/terms", onClick: () => navigate("/terms") },
    { label: "Cookie Policy", href: "/cookies", onClick: () => navigate("/cookies") },
    { label: "Accessibility", href: "/accessibility", onClick: () => navigate("/accessibility") },
  ];
  
  return { companyLinks, resourceLinks, legalLinks };
}
