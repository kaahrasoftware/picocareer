
import { Institution } from "@/types/database/institutions";
import { Button } from "@/components/ui/button";
import { Globe, Mail, Phone, MapPin } from "lucide-react";

interface InstitutionHeaderProps {
  institution: Institution;
}

export function InstitutionHeader({ institution }: InstitutionHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="relative h-48 rounded-lg overflow-hidden">
        {institution.banner_url ? (
          <img
            src={institution.banner_url}
            alt={`${institution.name} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No banner image</span>
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 flex items-center gap-4">
          <div className="h-24 w-24 rounded-lg overflow-hidden bg-background ring-4 ring-background">
            {institution.logo_url ? (
              <img
                src={institution.logo_url}
                alt={`${institution.name} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No logo</span>
              </div>
            )}
          </div>
          
          <div className="bg-background/80 backdrop-blur-sm p-2 rounded-lg">
            <h1 className="text-2xl font-bold">{institution.name}</h1>
            <p className="text-muted-foreground">{institution.type}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="text-muted-foreground">{institution.description}</p>
          
          {institution.contact_info && (
            <div className="space-y-2">
              {institution.contact_info.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{institution.contact_info.email}</span>
                </div>
              )}
              {institution.contact_info.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{institution.contact_info.phone}</span>
                </div>
              )}
              {institution.contact_info.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{institution.contact_info.address}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {institution.website && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(institution.website, '_blank')}
            >
              <Globe className="h-4 w-4 mr-2" />
              Visit Website
            </Button>
          )}
          
          {institution.social_links && (
            <div className="flex gap-2">
              {Object.entries(institution.social_links).map(([platform, url]) => (
                url && (
                  <Button
                    key={platform}
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(url, '_blank')}
                  >
                    <span className="sr-only">{platform}</span>
                    {/* You can add platform-specific icons here */}
                  </Button>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
