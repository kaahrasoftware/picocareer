
import React, { useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '@/integrations/supabase/client';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  uploadConfig?: {
    bucket: string;
    folderPath: string;
  };
}

export function RichTextEditor({ value, onChange, placeholder, uploadConfig }: RichTextEditorProps) {
  const imageHandler = async function(this: any) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      if (!input.files?.length) return;
      const file = input.files[0];

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = uploadConfig ? `${uploadConfig.folderPath}/${fileName}` : fileName;

        console.log('Uploading image to path:', filePath);

        const { error: uploadError, data } = await supabase.storage
          .from(uploadConfig?.bucket || 'announcement-images')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(uploadConfig?.bucket || 'announcement-images')
          .getPublicUrl(filePath);

        const quill = this.quill;
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'image', publicUrl);
        
        // Add custom class to make the image resizable
        const img = quill.root.querySelector(`img[src="${publicUrl}"]`);
        if (img) {
          img.className = 'resizable-image';
          img.style.border = '1px solid #ccc';
          img.style.padding = '2px';
          img.style.cursor = 'pointer';
          img.style.maxWidth = '100%';
          img.setAttribute('data-resize', 'true');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  return (
    <>
      <style>
        {`
          .ql-container {
            min-height: 200px;
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            background: white;
          }
          
          .ql-toolbar {
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            background: white;
            border-color: #e2e8f0;
          }
          
          .ql-editor {
            min-height: 200px;
            font-size: 1rem;
            line-height: 1.5;
          }

          .resizable-image {
            resize: both;
            overflow: hidden;
            min-width: 100px;
            min-height: 100px;
            border-radius: 4px;
          }
          
          .resizable-image:hover {
            border: 2px solid #0ea5e9 !important;
          }
          
          .resizable-image:active {
            border: 2px solid #0284c7 !important;
          }
          
          .ql-editor img {
            display: block;
            margin: 0.5rem 0;
            max-width: 100%;
          }

          .ql-editor p {
            margin-bottom: 1rem;
          }

          .ql-snow .ql-toolbar button:hover,
          .ql-snow .ql-toolbar button:focus,
          .ql-snow .ql-toolbar button.ql-active {
            color: #0ea5e9;
          }

          .ql-snow .ql-toolbar button:hover .ql-stroke,
          .ql-snow .ql-toolbar button:focus .ql-stroke,
          .ql-snow .ql-toolbar button.ql-active .ql-stroke {
            stroke: #0ea5e9;
          }

          .ql-snow .ql-toolbar button:hover .ql-fill,
          .ql-snow .ql-toolbar button:focus .ql-fill,
          .ql-snow .ql-toolbar button.ql-active .ql-fill {
            fill: #0ea5e9;
          }
        `}
      </style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="rounded-md border border-input"
      />
    </>
  );
}
