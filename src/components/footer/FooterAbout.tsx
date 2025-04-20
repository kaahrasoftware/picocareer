
import { Mail, Phone, MapPin } from "lucide-react";

export function FooterAbout() {
  return (
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
        <a href="tel:+19194435301" 
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Phone className="w-4 h-4 mr-2" />
          +1 (919) 443-5301
        </a>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Lomé, Togo, West Africa</span>
        </div>
      </div>
    </div>
  );
}
