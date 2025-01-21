import { useNavigate } from "react-router-dom";
import { Mail, Phone, Facebook, Instagram, Linkedin, Youtube, Twitter } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    { label: "Events", href: "/event", onClick: () => navigate("/event") },
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
      href: "https://x.com/pico_career",
      label: "X (Twitter)"
    },
    { 
      icon: <Youtube className="w-5 h-5" />, 
      href: "https://youtube.com/@picocareer",
      label: "YouTube"
    }
  ];

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // First check if email exists
      const { data: existingEmail } = await supabase
        .from('email_subscriptions')
        .select('email')
        .eq('email', email)
        .single();

      if (existingEmail) {
        toast.error('This email is already subscribed to our newsletter');
        return;
      }

      // If email doesn't exist, insert it
      const { error } = await supabase
        .from('email_subscriptions')
        .insert([{ email }]);

      if (error) throw error;

      toast.success('Thank you for subscribing to our newsletter!');
      setEmail(''); // Clear the input after successful submission
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error);
      // Handle specific error cases
      if (error.code === '23505') {
        toast.error('This email is already subscribed to our newsletter');
      } else {
        toast.error('Failed to subscribe. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <form onSubmit={handleEmailSubmit} className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isSubmitting}
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
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
