
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadButtonProps {
  uploading: boolean;
  hasValue: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept: string;
}

export function UploadButton({
  uploading,
  hasValue,
  onInputChange,
  accept
}: UploadButtonProps) {
  return (
    <Button
      type="button"
      variant={hasValue ? "secondary" : "outline"}
      className={`relative min-w-[200px] transition-all duration-200 ${
        uploading ? 'cursor-not-allowed opacity-70' : ''
      }`}
      disabled={uploading}
    >
      <label className="flex items-center gap-2 cursor-pointer w-full justify-center">
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={onInputChange}
          disabled={uploading}
        />
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-2">Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>{hasValue ? 'Change File' : 'Upload File'}</span>
          </>
        )}
      </label>
    </Button>
  );
}
