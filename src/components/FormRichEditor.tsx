
import React, { useRef, useCallback } from 'react';
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

export function FormRichEditor({ 
  value, 
  onChange, 
  placeholder, 
  uploadConfig 
}: FormRichEditorProps) {
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const quillRef = useRef<ReactQuill>(null);

  // Memoize the image upload handler to prevent recreating on every render
  const handleImageUpload = useCallback(() => {
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
  }, [uploadConfig, supabase.storage, toast]);

  // Memoize modules to prevent recreation
  const modules = React.useMemo(() => ({
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
  }), [handleImageUpload]);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  // Stable onChange handler
  const handleChange = useCallback((content: string) => {
    console.log('FormRichEditor onChange called with:', content?.length, 'characters');
    onChange(content);
  }, [onChange]);

  // Add debugging to track component lifecycle
  React.useEffect(() => {
    console.log('FormRichEditor mounted/updated with value length:', value?.length);
    return () => {
      console.log('FormRichEditor cleanup');
    };
  }, [value]);

  return (
    <div className="form-rich-editor" key="stable-rich-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        preserveWhitespace
      />
      <style>{`
        .form-rich-editor .ql-editor {
          min-height: 200px;
          max-height: 500px;
          overflow-y: auto;
          background-color: white;
        }
        .form-rich-editor .ql-toolbar {
          background-color: #f9fafb;
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
        }
        .form-rich-editor .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          background-color: white;
        }
        .form-rich-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
