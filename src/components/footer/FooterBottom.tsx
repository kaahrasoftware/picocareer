
import { ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FooterSocials } from "./FooterSocials";

export function FooterBottom() {
  return (
    <div className="pt-8">
      {/* Decorative Separator with gradient */}
      <Separator className="mb-8 bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Social Links */}
        <FooterSocials />
        
        {/* Copyright and Product Info */}
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
    </div>
  );
}
