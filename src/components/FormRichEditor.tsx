
import { useState, useEffect } from "react";

interface FormRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FormRichEditor({ value, onChange, placeholder }: FormRichEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="border border-input rounded-md">
      <div className="bg-muted px-3 py-2 border-b flex items-center gap-1">
        <button
          type="button"
          className="p-1 hover:bg-muted-foreground/10 rounded"
          onClick={() => onChange(`${value}<h2>Heading</h2>`)}
        >
          <strong>H</strong>
        </button>
        <button
          type="button"
          className="p-1 hover:bg-muted-foreground/10 rounded"
          onClick={() => onChange(`${value}<strong>bold</strong>`)}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="p-1 hover:bg-muted-foreground/10 rounded italic"
          onClick={() => onChange(`${value}<em>italic</em>`)}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className="p-1 hover:bg-muted-foreground/10 rounded"
          onClick={() => onChange(`${value}<ul><li>List item</li></ul>`)}
        >
          • List
        </button>
        <button
          type="button"
          className="p-1 hover:bg-muted-foreground/10 rounded"
          onClick={() => onChange(`${value}<a href="#">Link</a>`)}
        >
          🔗
        </button>
      </div>
      <div 
        className="min-h-32 p-3 focus:outline-none"
        contentEditable
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        aria-placeholder={placeholder}
        data-placeholder={placeholder}
        style={{
          position: 'relative',
        }}
      />
      {!value && !isFocused && (
        <div 
          className="absolute pointer-events-none text-muted-foreground p-3"
          style={{ 
            marginTop: '-8rem',
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}
