
import { FileText, Image, Video, Music, Link2, File } from "lucide-react";
import { HubResource } from "@/types/database/hubs";

export const getResourceIcon = (resource: HubResource) => {
  switch (resource.resource_type) {
    case 'document':
      return <FileText className="h-5 w-5" />;
    case 'image':
      return <Image className="h-5 w-5" />;
    case 'video':
      return <Video className="h-5 w-5" />;
    case 'audio':
      return <Music className="h-5 w-5" />;
    case 'external_link':
      return <Link2 className="h-5 w-5" />;
    default:
      return <File className="h-5 w-5" />;
  }
};
