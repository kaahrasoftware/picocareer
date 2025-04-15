
import { useState, useEffect } from "react";
import { Bold, Italic, Heading, Link, List, Type, AlignLeft, AlignCenter, AlignRight, Underline } from "lucide-react";

interface FormRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FormRichEditor({ value, onChange, placeholder }: FormRichEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    const selection = document.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const editorDiv = document.querySelector('[contenteditable="true"]');
      if (editorDiv) {
        onChange(editorDiv.innerHTML);
      }
    }
  };
  
  return (
    <div className="border border-input rounded-md">
      <div className="bg-muted px-3 py-2 border-b flex flex-wrap items-center gap-1">
        <div className="flex items-center mr-2 border-r pr-2">
          <button
            type="button"
            className="p-1 hover:bg-muted-foreground/10 rounded"
            onClick={() => execCommand('formatBlock', '<h1>')}
            title="Heading 1"
          >
            <Heading size={18} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-muted-foreground/10 rounded"
            onClick={() => execCommand('formatBlock', '<h2>')}
            title="Heading 2"
          >
            <Heading size={16} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-muted-foreground/10 rounded"
            onClick={() => execCommand('formatBlock', '<p>')}
            title="Paragraph"
          >
            <Type size={16} />
          </button>
        </div>
        
        <div className="flex items-center mr-2 border-r pr-2">
          <button
            type="button"
            className="p-1 hover:bg-muted-foreground/10 rounded"
            onClick={() => execCommand('bold')}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-muted-foreground/10 rounded"
            onClick={() => execCommand('italic')}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-muted-foreground/10 rounded"
            onClick={() => execCommand('underline')}
            title="Underline"
          >
            <Underline size={16} />
          </button>
        </div>
        
        <div className="flex items-center mr-2 border-r pr-2">
          <button
            type="button"
            className="p-1 hover:bg-muted-foreground/10 rounded"
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-muted-foreground/10 rounded"
            onClick={() => execCommand('insertOrderedList')}
            title="Numbered List"
          >
            <span className="font-semibold text-sm">1.</span>
          </button>
        </div>
        
        <div className="flex items-center mr-2 border-r pr-2">
          <button
            type="button"
            className="p-1 hover:bg-muted-foreground/10 rounded"
            onClick={() => execCommand('justifyLeft')}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-muted-foreground/10 rounded"
            onClick={() => execCommand('justifyCenter')}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-muted-foreground/10 rounded"
            onClick={() => execCommand('justifyRight')}
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
        </div>
        
        <button
          type="button"
          className="p-1 hover:bg-muted-foreground/10 rounded"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) execCommand('createLink', url);
          }}
          title="Insert Link"
        >
          <Link size={16} />
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
