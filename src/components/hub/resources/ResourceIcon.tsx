
import { File, FileImage, FileText, FileVideo, Link } from "lucide-react";
import { ResourceType } from "@/types/database/hubs";

interface ResourceIconProps {
  resourceType: ResourceType;
  className?: string;
}

export function ResourceIcon({ resourceType, className = "" }: ResourceIconProps) {
  switch (resourceType) {
    case "document":
      return <FileText className={className} />;
    case "image":
      return <FileImage className={className} />;
    case "video":
      return <FileVideo className={className} />;
    case "link":
      return <Link className={className} />;
    case "event":
      return <File className={className} />;
    default:
      return <File className={className} />;
  }
}
