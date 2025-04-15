
interface FormRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FormRichEditor({ value, onChange, placeholder }: FormRichEditorProps) {
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
        contentEditable
        className="min-h-32 p-3 focus:outline-none"
        placeholder={placeholder}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}
