import { ExternalLink, Instagram, Facebook, Linkedin, Youtube, Twitter } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Social media links configuration
const socialLinks = [{
  icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.12v-3.46a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 16a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.33c.98.69 2.15 1.1 3.41 1.1v-3.44a4.85 4.85 0 0 1-1.5.7Z" />
    </svg>,
  href: "https://tiktok.com/@picocareer",
  label: "TikTok",
  color: "group-hover:text-slate-800 dark:group-hover:text-white"
}, {
  icon: <Instagram className="w-5 h-5" />,
  href: "https://instagram.com/picocareer",
  label: "Instagram",
  color: "group-hover:text-pink-500 dark:group-hover:text-pink-400"
}, {
  icon: <Facebook className="w-5 h-5" />,
  href: "https://facebook.com/picocareer",
  label: "Facebook",
  color: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
}, {
  icon: <Linkedin className="w-5 h-5" />,
  href: "https://linkedin.com/company/picocareer",
  label: "LinkedIn",
  color: "group-hover:text-blue-700 dark:group-hover:text-blue-400"
}, {
  icon: <Twitter className="w-5 h-5" />,
  href: "https://x.com/pico_career",
  label: "X (Twitter)",
  color: "group-hover:text-sky-500 dark:group-hover:text-sky-400"
}, {
  icon: <Youtube className="w-5 h-5" />,
  href: "https://youtube.com/@picocareer",
  label: "YouTube",
  color: "group-hover:text-red-600 dark:group-hover:text-red-500"
}];
export function FooterSocials() {
  return <div className="flex flex-wrap justify-center gap-3">
      <TooltipProvider delayDuration={300}>
        {socialLinks.map((link, index) => <Tooltip key={index}>
            <TooltipTrigger asChild>
              <a href={link.href} target="_blank" rel="noopener noreferrer" className={cn("group text-muted-foreground transition-all duration-300 p-2.5 hover:bg-muted/80 rounded-full hover:scale-110", link.color)} aria-label={link.label}>
                {link.icon}
                
                {/* Subtle animated ring effect on hover */}
                
              </a>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs font-medium">
              {link.label}
            </TooltipContent>
          </Tooltip>)}
      </TooltipProvider>
    </div>;
}