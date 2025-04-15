
import { useNavigate } from "react-router-dom";
import { Mail, Phone, Facebook, Instagram, Linkedin, Youtube, Twitter, ExternalLink, MapPin, ChevronUp, ArrowUp } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const socialLinks = [
    { 
      icon: <Instagram className="w-5 h-5" />, 
      href: "https://instagram.com/picocareer",
      label: "Instagram",
      color: "group-hover:text-pink-500 dark:group-hover:text-pink-400"
    },
    { 
      icon: <Facebook className="w-5 h-5" />, 
      href: "https://facebook.com/picocareer",
      label: "Facebook",
      color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
    },
    { 
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.12v-3.46a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 16a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.33c.98.69 2.15 1.1 3.41 1.1v-3.44a4.85 4.85 0 0 1-1.5.7Z"/>
      </svg>, 
      href: "https://tiktok.com/@picocareer",
      label: "TikTok",
      color: "group-hover:text-slate-800 dark:group-hover:text-white"
    },
    { 
      icon: <Linkedin className="w-5 h-5" />, 
      href: "https://linkedin.com/company/picocareer",
      label: "LinkedIn",
      color: "group-hover:text-blue-700 dark:group-hover:text-blue-400"
    },
    { 
      icon: <Twitter className="w-5 h-5" />, 
      href: "https://x.com/pico_career",
      label: "X (Twitter)",
      color: "group-hover:text-sky-500 dark:group-hover:text-sky-400"
    },
    { 
      icon: <Youtube className="w-5 h-5" />, 
      href: "https://youtube.com/@picocareer",
      label: "YouTube",
      color: "group-hover:text-red-600 dark:group-hover:text-red-500"
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          <div className="w-full md:w-auto max-w-md">
            <form onSubmit={handleEmailSubmit} className="relative">
              <div className="flex items-center">
                <input
                  type="email"
                  placeholder="Subscribe to our newsletter"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-l-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                  disabled={isSubmitting}
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-r-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Get the latest updates, resources, and opportunities
              </p>
            </form>
          </div>
          
          {/* Back to Top Button */}
          <Button 
            onClick={scrollToTop} 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 group"
          >
            <span>Back to Top</span>
            <ChevronUp className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </div>

        {/* Main Grid with Links Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About Summary */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base border-b pb-2 border-muted">About PicoCareer</h4>
            <p className="text-sm text-muted-foreground">
              PicoCareer helps students and professionals navigate their educational 
              and career paths with personalized guidance, mentorship, and resources.
            </p>
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
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Lomé, Togo, West Africa</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-base border-b pb-2 border-muted">Company</h4>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link, index) => (
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

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold text-base border-b pb-2 border-muted">Resources</h4>
            <ul className="mt-4 space-y-3">
              {resourceLinks.map((link, index) => (
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

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-base border-b pb-2 border-muted">Legal</h4>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link, index) => (
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
        </div>

        {/* Footer Bottom - Redesigned Section */}
        <div className="pt-8">
          {/* Decorative Separator with gradient */}
          <Separator className="mb-8 bg-gradient-to-r from-transparent via-border to-transparent" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Links - Enhanced with tooltips and hover effects */}
            <div className="flex flex-wrap justify-center gap-3">
              <TooltipProvider delayDuration={300}>
                {socialLinks.map((link, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group text-muted-foreground transition-all duration-300 p-2.5 hover:bg-muted/80 rounded-full hover:scale-110 ${link.color}`}
                        aria-label={link.label}
                      >
                        {link.icon}
                        
                        {/* Subtle animated ring effect on hover */}
                        <span className="absolute inset-0 rounded-full bg-transparent border border-transparent group-hover:border-muted-foreground/20 group-hover:scale-110 transition-all duration-300"></span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs font-medium">
                      {link.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
            
            {/* Copyright and Product Info - Improved layout */}
            <div className="text-center md:text-right mt-4 md:mt-0">
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-end gap-2 text-sm text-muted-foreground">
                <p className="font-medium">&copy; {new Date().getFullYear()} PicoCareer</p>
                <span className="hidden md:inline-block mx-2">•</span>
                <p>All rights reserved</p>
              </div>
              
              <div className="mt-2 md:mt-1">
                <a 
                  href="https://kaahra.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors gap-1 group"
                >
                  A product of 
                  <span className="font-bold underline-offset-4 group-hover:underline ml-1">Kaahra</span>
                  <ExternalLink className="h-3 w-3 ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Back to Top Button - Mobile Only */}
          <div className="flex justify-center mt-8 md:hidden">
            <Button
              onClick={scrollToTop}
              size="icon"
              variant="outline"
              className="rounded-full h-10 w-10 border-muted-foreground/30 hover:border-muted-foreground/60 hover:bg-muted/50 transition-all duration-300"
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

