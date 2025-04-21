
import { Mail, Phone, MapPin } from "lucide-react";
export function FooterAbout() {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-base border-b pb-2 border-muted">About PicoCareer</h4>
      <div className="space-y-3">
        <a
          href="mailto:info@picocareer.com"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Mail className="w-4 h-4 mr-2" />
          info@picocareer.com
        </a>
        <div>
          <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="w-4 h-4 mr-2" />
            <a href="tel:+19194435301" className="underline hover:text-blue-600">
              +1 (919) 443-5301
            </a>
            <span className="ml-2 text-xs text-muted-foreground">(USA)</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-1">
            <Phone className="w-4 h-4 mr-2" />
            <a href="tel:+254742486604" className="underline hover:text-blue-600">
              +254 (742) 486-604
            </a>
            <span className="ml-2 text-xs text-muted-foreground">(Kenya)</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-1">
            <Phone className="w-4 h-4 mr-2" />
            <a href="tel:+22897476446" className="underline hover:text-blue-600">
              +228 (97) 47-64-46
            </a>
            <span className="ml-2 text-xs text-muted-foreground">(Togo)</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>131 Continental Dr Suite 305 Newark, DE, 19713 US</span>
        </div>
      </div>
    </div>
  );
}
