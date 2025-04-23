import React, { useState, useEffect, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useToast } from "@/hooks/use-toast";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import ImageUploader from 'quill-image-uploader';

Quill.register('modules/imageUploader', ImageUploader);

interface FormRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  uploadConfig?: {
    bucket: string;
    folderPath: string;
  };
}

const bucketUrl = `https://wurdmlkfkzuivvwxjmxk.supabase.co/storage/v1/object/public/`;

export function FormRichEditor({ value, onChange, placeholder, uploadConfig }: FormRichEditorProps) {
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const [isMounted, setIsMounted] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const imageHandler = async (image: File) => {
    if (!uploadConfig) {
      toast({
        title: "Upload Configuration Missing",
        description: "Please provide upload configuration to enable image uploads.",
        variant: "destructive",
      });
      return null;
    }

    const { bucket, folderPath } = uploadConfig;
    const imageName = `${Date.now()}-${image.name}`;
    const fullPath = `${folderPath}${imageName}`;

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, image, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const imageUrl = `${bucketUrl}${bucket}/${fullPath}`;
      return imageUrl;
    } catch (error: any) {
      toast({
        title: "Image Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
    imageUploader: {
      upload: imageHandler,
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
      <style>
        {`
        .ql-editor {
          min-height: 200px;
          max-height: 500px;
          overflow-y: auto;
        }
        .ql-toolbar {
          background-color: #f9fafb;
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
        }
        .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          background-color: white;
        }
        `}
      </style>
    </div>
  );
}
