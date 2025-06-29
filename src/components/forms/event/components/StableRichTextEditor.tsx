
import React, { useRef, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface StableRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function StableRichTextEditor({ 
  value, 
  onChange, 
  placeholder 
}: StableRichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  // Memoize modules to prevent recreation
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['blockquote', 'link'],
        ['clean']
      ]
    }
  }), []);

  const formats = useMemo(() => [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'link'
  ], []);

  // Stable onChange handler
  const handleChange = useCallback((content: string) => {
    onChange(content);
  }, [onChange]);

  return (
    <div className="stable-rich-editor">
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
        .stable-rich-editor .ql-editor {
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
          background-color: white;
        }
        .stable-rich-editor .ql-toolbar {
          background-color: #f9fafb;
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
        }
        .stable-rich-editor .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          background-color: white;
        }
        .stable-rich-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
