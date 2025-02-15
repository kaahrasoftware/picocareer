
import { FileIcon } from "lucide-react";

interface FilePreviewProps {
  file: File;
  filePreview: string | null;
}

export function FilePreview({ file, filePreview }: FilePreviewProps) {
  if (!file) return null;

  if (file.type.startsWith('image/')) {
    return (
      <div className="mt-2 relative inline-block">
        <img 
          src={filePreview!} 
          alt="Preview" 
          className="max-h-32 rounded-lg"
        />
      </div>
    );
  }

  if (file.type.startsWith('video/')) {
    return (
      <div className="mt-2 relative inline-block">
        <video 
          src={filePreview!} 
          className="max-h-32 rounded-lg" 
          controls
        >
          Your browser doesn't support video preview.
        </video>
      </div>
    );
  }

  const getFileIcon = () => {
    if (file.type.includes('pdf')) return <FileIcon className="h-6 w-6 text-red-500" />;
    if (file.type.includes('word')) return <FileIcon className="h-6 w-6 text-blue-500" />;
    if (file.type.includes('sheet') || file.type.includes('excel')) return <FileIcon className="h-6 w-6 text-green-500" />;
    if (file.type.includes('presentation')) return <FileIcon className="h-6 w-6 text-orange-500" />;
    return <FileIcon className="h-6 w-6" />;
  };

  return (
    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
      {getFileIcon()}
      <span>{file.name}</span>
    </div>
  );
}
