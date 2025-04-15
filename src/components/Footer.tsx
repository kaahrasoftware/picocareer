
import { Mail, Phone } from "lucide-react";
import { FooterNewsletter } from "./footer/FooterNewsletter";
import { FooterLinkSection, useFooterLinks } from "./footer/FooterLinkSection";
import { FooterAbout } from "./footer/FooterAbout";
import { BackToTopButton } from "./footer/BackToTopButton";
import { FooterBottom } from "./footer/FooterBottom";

export function Footer() {
  const { companyLinks, resourceLinks, legalLinks } = useFooterLinks();

  return (
    <footer className="mt-20 border-t border-border bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        {/* Top section with logo, newsletter, and back to top button */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          {/* Logo */}
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
          
          {/* Newsletter Subscription */}
          <FooterNewsletter />
          
          {/* Back to Top Button */}
          <BackToTopButton />
        </div>

        {/* Main Grid with Links Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About Summary */}
          <FooterAbout />

          {/* Company Links */}
          <FooterLinkSection title="Company" links={companyLinks} />

          {/* Resources Links */}
          <FooterLinkSection title="Resources" links={resourceLinks} />

          {/* Legal Links */}
          <FooterLinkSection title="Legal" links={legalLinks} />
        </div>

        {/* Footer Bottom Section */}
        <FooterBottom />
        
        {/* Back to Top Button - Mobile Only */}
        <BackToTopButton isMobile={true} />
      </div>
    </footer>
  );
}
