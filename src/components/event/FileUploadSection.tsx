
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Film,
  Music,
  Image,
  Archive
} from 'lucide-react';
import { useEventResourceUpload } from '@/hooks/useEventResourceUpload';
import { cn } from '@/lib/utils';

interface FileUploadSectionProps {
  eventId: string;
  onFileUploaded: (url: string, metadata: { fileName: string; size: number; type: string }) => void;
  disabled?: boolean;
  maxFiles?: number;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('video/')) return <Film className="h-5 w-5" />;
  if (type.startsWith('audio/')) return <Music className="h-5 w-5" />;
  if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return <FileText className="h-5 w-5" />;
  if (type.includes('zip') || type.includes('rar')) return <Archive className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
};

const getFileTypeColor = (type: string) => {
  if (type.startsWith('video/')) return 'bg-red-50 text-red-700 border-red-200';
  if (type.startsWith('audio/')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (type.startsWith('image/')) return 'bg-green-50 text-green-700 border-green-200';
  if (type.includes('pdf') || type.includes('document')) return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export function FileUploadSection({ 
  eventId, 
  onFileUploaded, 
  disabled = false,
  maxFiles = 1 
}: FileUploadSectionProps) {
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: number }>({});
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    status: 'uploading' | 'completed' | 'error';
    url?: string;
  }>>([]);

  const { uploading, uploadFile, getAcceptedTypes } = useEventResourceUpload({
    onUploadSuccess: (url, metadata) => {
      onFileUploaded(url, metadata);
    }
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;

    for (const file of acceptedFiles) {
      const fileId = crypto.randomUUID();
      
      // Add file to uploading state
      setUploadedFiles(prev => [...prev, {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading'
      }]);

      try {
        const url = await uploadFile(file, eventId);
        
        if (url) {
          // Update file status to completed
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'completed' as const, url }
              : f
          ));
        } else {
          // Update file status to error
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error' as const }
              : f
          ));
        }
      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error' as const }
            : f
        ));
      }
    }
  }, [disabled, eventId, uploadFile, onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || uploading,
    maxFiles,
    accept: getAcceptedTypes()
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium">
              {isDragActive ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports videos, documents, audio, images (max 100MB each)
            </p>
          </div>
          <Button variant="outline" size="sm" disabled={disabled || uploading}>
            Choose Files
          </Button>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-white"
            >
              <div className={cn("p-2 rounded", getFileTypeColor(file.type))}>
                {getFileIcon(file.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>

              <div className="flex items-center gap-2">
                {file.status === 'uploading' && (
                  <>
                    <Progress value={undefined} className="w-16 h-2" />
                    <span className="text-xs text-gray-500">Uploading...</span>
                  </>
                )}
                
                {file.status === 'completed' && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Uploaded
                  </Badge>
                )}
                
                {file.status === 'error' && (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Error
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
