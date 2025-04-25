
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useToast } from "@/hooks/use-toast";
import { useSupabaseClient } from '@supabase/auth-helpers-react';

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

  // Function to handle image upload manually
  const handleImageUpload = () => {
    if (!uploadConfig) {
      toast({
        title: "Upload Configuration Missing",
        description: "Please provide upload configuration to enable image uploads.",
        variant: "destructive",
      });
      return;
    }
    
    // Create an input element 
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      if (!input.files || !input.files[0]) return;
      
      const file = input.files[0];
      const { bucket, folderPath } = uploadConfig;
      const imageName = `${Date.now()}-${file.name}`;
      const fullPath = `${folderPath}${imageName}`;

      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fullPath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        const imageUrl = `${bucketUrl}${bucket}/${fullPath}`;
        
        // Insert the image into the editor
        const editor = quillRef.current?.getEditor();
        if (editor) {
          const range = editor.getSelection();
          const index = range ? range.index : 0;
          editor.insertEmbed(index, 'image', imageUrl);
          editor.setSelection(index + 1, 0);
        }
      } catch (error: any) {
        toast({
          title: "Image Upload Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: handleImageUpload
      }
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
