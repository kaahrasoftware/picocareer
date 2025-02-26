
import React, { useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '@/integrations/supabase/client';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

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
      image: function() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
          if (!input.files?.length) return;
          const file = input.files[0];

          try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${crypto.randomUUID()}.${fileExt}`;

            const { error: uploadError, data } = await supabase.storage
              .from('announcement-images')
              .upload(filePath, file, {
                contentType: file.type,
                upsert: false
              });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('announcement-images')
              .getPublicUrl(filePath);

            const quill = (this as any).quill;
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
      }
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

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <>
      <style>
        {`
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
        className="min-h-[200px] bg-gray-50 rounded-md"
      />
    </>
  );
}
