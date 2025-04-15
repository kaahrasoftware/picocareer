
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Bold, Italic, Heading, Link, List, Type, AlignLeft, AlignCenter, AlignRight, Underline,
  Strikethrough, Superscript, Subscript, Palette, SquareAsterisk, Smile, Text, 
  Undo, Redo, Eraser, AlignJustify
} from "lucide-react";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type FontFamily = 
  | "Arial" 
  | "Verdana" 
  | "Tahoma" 
  | "Trebuchet MS" 
  | "Times New Roman" 
  | "Georgia" 
  | "Courier New" 
  | "Brush Script MT";

const FONT_FAMILIES: FontFamily[] = [
  "Arial", 
  "Verdana", 
  "Tahoma", 
  "Trebuchet MS", 
  "Times New Roman", 
  "Georgia", 
  "Courier New", 
  "Brush Script MT"
];

const FONT_SIZES = [
  "1", "2", "3", "4", "5", "6", "7"
];

const TEXT_COLORS = [
  "#000000", "#333333", "#666666", "#8B5CF6", "#D946EF", "#F97316", 
  "#0EA5E9", "#10B981", "#EF4444", "#F59E0B"
];

const BACKGROUND_COLORS = [
  "transparent", "#F1F0FB", "#E5DEFF", "#FFDEE2", "#FDE1D3", 
  "#FEC6A1", "#FEF7CD", "#F2FCE2", "#D3E4FD"
];

export function FormRichEditor({ value, onChange, placeholder }: FormRichEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("formatting");
  const [selection, setSelection] = useState<Range | null>(null);
  
  // Save selection when editor is focused or content is selected
  const saveSelection = useCallback(() => {
    if (window.getSelection && document.createRange) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        setSelection(sel.getRangeAt(0).cloneRange());
      }
    }
  }, []);
  
  // Restore selection before executing commands
  const restoreSelection = useCallback(() => {
    if (selection && window.getSelection) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(selection);
      }
    }
  }, [selection]);
  
  // Handle initial content and external value changes
  useEffect(() => {
    if (editorRef.current && !isFocused) {
      // Only update the innerHTML when not focused to avoid cursor jumping
      editorRef.current.innerHTML = value;
    }
  }, [value, isFocused]);

  // Execute rich text commands
  const execCommand = useCallback((command: string, value?: string) => {
    restoreSelection();
    document.execCommand(command, false, value);
    
    // Update the value after command execution
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      saveSelection();
    }
  }, [onChange, restoreSelection, saveSelection]);
  
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      saveSelection();
    }
  };
  
  const insertEmoji = (emojiData: EmojiClickData) => {
    restoreSelection();
    document.execCommand('insertText', false, emojiData.emoji);
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      saveSelection();
    }
    
    setShowEmojiPicker(false);
  };
  
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    execCommand('fontName', e.target.value);
  };
  
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    execCommand('fontSize', e.target.value);
  };
  
  return (
    <div className="border border-input rounded-md">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-muted justify-start h-auto flex-wrap border-b rounded-none">
          <TabsTrigger value="formatting" className="py-1 px-2 h-auto data-[state=active]:bg-background">
            <Type size={14} className="mr-1" />
            <span className="text-xs">Formatting</span>
          </TabsTrigger>
          <TabsTrigger value="alignment" className="py-1 px-2 h-auto data-[state=active]:bg-background">
            <AlignLeft size={14} className="mr-1" />
            <span className="text-xs">Alignment</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="py-1 px-2 h-auto data-[state=active]:bg-background">
            <Palette size={14} className="mr-1" />
            <span className="text-xs">Colors</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="py-1 px-2 h-auto data-[state=active]:bg-background">
            <SquareAsterisk size={14} className="mr-1" />
            <span className="text-xs">Advanced</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="formatting" className="p-1 space-y-1 border-b">
          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center mr-2 border-r pr-2">
              <select 
                className="h-8 bg-background border border-input rounded px-2 py-1 text-xs"
                onChange={handleFontFamilyChange}
                onClick={() => saveSelection()}
              >
                <option value="">Font Family</option>
                {FONT_FAMILIES.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
              
              <select 
                className="h-8 ml-1 bg-background border border-input rounded px-2 py-1 text-xs"
                onChange={handleFontSizeChange}
                onClick={() => saveSelection()}
              >
                <option value="">Size</option>
                {FONT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            
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
              <button
                type="button"
                className="p-1 hover:bg-muted-foreground/10 rounded"
                onClick={() => execCommand('strikeThrough')}
                title="Strikethrough"
              >
                <Strikethrough size={16} />
              </button>
            </div>
            
            <div className="flex items-center">
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
          </div>
        </TabsContent>
        
        <TabsContent value="alignment" className="p-1 space-y-1 border-b">
          <div className="flex items-center gap-1">
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
            <button
              type="button"
              className="p-1 hover:bg-muted-foreground/10 rounded"
              onClick={() => execCommand('justifyFull')}
              title="Justify"
            >
              <AlignJustify size={16} />
            </button>
          </div>
        </TabsContent>
        
        <TabsContent value="colors" className="p-1 space-y-1 border-b">
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium mb-1">Text Color</p>
              <div className="flex flex-wrap gap-1">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded-full border border-input flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => execCommand('foreColor', color)}
                    title={`Text color: ${color}`}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-xs font-medium mb-1">Background Color</p>
              <div className="flex flex-wrap gap-1">
                {BACKGROUND_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded-full border border-input flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => execCommand('hiliteColor', color)}
                    title={`Background color: ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="p-1 space-y-1 border-b">
          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center mr-2 border-r pr-2">
              <button
                type="button"
                className="p-1 hover:bg-muted-foreground/10 rounded"
                onClick={() => execCommand('superscript')}
                title="Superscript"
              >
                <Superscript size={16} />
              </button>
              <button
                type="button"
                className="p-1 hover:bg-muted-foreground/10 rounded"
                onClick={() => execCommand('subscript')}
                title="Subscript"
              >
                <Subscript size={16} />
              </button>
            </div>
            
            <div className="flex items-center mr-2 border-r pr-2">
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
              
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="p-1 hover:bg-muted-foreground/10 rounded"
                    title="Insert Emoji"
                    onClick={() => saveSelection()}
                  >
                    <Smile size={16} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <EmojiPicker 
                    onEmojiClick={insertEmoji} 
                    theme={Theme.LIGHT}
                    width={300}
                    height={350}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center">
              <button
                type="button"
                className="p-1 hover:bg-muted-foreground/10 rounded"
                onClick={() => execCommand('undo')}
                title="Undo"
              >
                <Undo size={16} />
              </button>
              <button
                type="button"
                className="p-1 hover:bg-muted-foreground/10 rounded"
                onClick={() => execCommand('redo')}
                title="Redo"
              >
                <Redo size={16} />
              </button>
              <button
                type="button"
                className="p-1 hover:bg-muted-foreground/10 rounded"
                onClick={() => execCommand('removeFormat')}
                title="Clear Formatting"
              >
                <Eraser size={16} />
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div 
        ref={editorRef}
        className="min-h-32 p-3 focus:outline-none"
        contentEditable
        onFocus={() => {
          setIsFocused(true);
          saveSelection();
        }}
        onBlur={() => {
          setIsFocused(false);
          handleInput();
        }}
        onInput={handleInput}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        aria-placeholder={placeholder}
        data-placeholder={placeholder}
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

      <style jsx global>{`
        [contenteditable] {
          outline: none;
        }
        
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #a9a9a9;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
