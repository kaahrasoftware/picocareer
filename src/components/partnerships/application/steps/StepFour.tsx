
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { StepProps } from '../types';

export function StepFour({ form, data }: StepProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const currentDocs = form.getValues('supporting_documents') || [];
    
    const newDocs = acceptedFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file), // In real app, this would be uploaded to storage
      type: file.type,
      size: file.size,
    }));
    
    form.setValue('supporting_documents', [...currentDocs, ...newDocs]);
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeDocument = (index: number) => {
    const currentDocs = form.getValues('supporting_documents') || [];
    form.setValue('supporting_documents', currentDocs.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Optional: Upload supporting documents to strengthen your application.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Organization brochures or fact sheets</li>
              <li>Accreditation certificates</li>
              <li>Letters of intent or recommendation</li>
              <li>Program descriptions or curricula</li>
              <li>Annual reports or impact statements</li>
            </ul>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX, PNG, JPG (max 10MB each)
                </p>
              </div>
            )}
          </div>

          {(data.supporting_documents || []).length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Uploaded Documents</h4>
              <div className="space-y-2">
                {(data.supporting_documents || []).map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Document Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Files should be in PDF, DOC, DOCX, PNG, or JPG format</li>
              <li>• Maximum file size is 10MB per document</li>
              <li>• Ensure documents are clear and legible</li>
              <li>• Remove any sensitive or confidential information</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
