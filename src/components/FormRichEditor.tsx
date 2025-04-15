
import { useState, useEffect, useRef, useCallback } from "react";
import { Bold, Italic, Heading, Link, List, Type, AlignLeft, AlignCenter, AlignRight, Underline, Strikethrough, Superscript, Subscript, Palette, SquareAsterisk, Smile, Text, Undo, Redo, Eraser, AlignJustify } from "lucide-react";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface FormRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type FontFamily = "Arial" | "Verdana" | "Tahoma" | "Trebuchet MS" | "Times New Roman" | "Georgia" | "Courier New" | "Brush Script MT";
const FONT_FAMILIES: FontFamily[] = ["Arial", "Verdana", "Tahoma", "Trebuchet MS", "Times New Roman", "Georgia", "Courier New", "Brush Script MT"];
const FONT_SIZES = ["1", "2", "3", "4", "5", "6", "7"];
const TEXT_COLORS = ["#000000", "#333333", "#666666", "#8B5CF6", "#D946EF", "#F97316", "#0EA5E9", "#10B981", "#EF4444", "#F59E0B"];
const BACKGROUND_COLORS = ["transparent", "#F1F0FB", "#E5DEFF", "#FFDEE2", "#FDE1D3", "#FEC6A1", "#FEF7CD", "#F2FCE2", "#D3E4FD"];

export function FormRichEditor({
  value,
  onChange,
  placeholder
}: FormRichEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selection, setSelection] = useState<Range | null>(null);
  const [isTextSelected, setIsTextSelected] = useState(false);
  const selectionRef = useRef<Range | null>(null);
  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    fontFamily: string;
    fontSize: string;
    textColor: string;
    backgroundColor: string;
    alignment: string;
  }>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    fontFamily: "",
    fontSize: "",
    textColor: "",
    backgroundColor: "",
    alignment: "left"
  });

  // Function to safely save the current selection
  const saveSelection = useCallback(() => {
    if (window.getSelection && document.createRange) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
          const savedRange = range.cloneRange();
          setSelection(savedRange);
          selectionRef.current = savedRange;
          setIsTextSelected(!range.collapsed);

          // Check active formatting for the current selection
          checkActiveFormats(sel);
          return savedRange;
        }
      }
    }
    return null;
  }, []);

  // Check which formatting options are active for the current selection
  const checkActiveFormats = useCallback((selection: Selection) => {
    if (!selection || selection.rangeCount === 0) return;

    // Query command state for various formatting options
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikeThrough'),
      fontFamily: document.queryCommandValue('fontName') || "",
      fontSize: document.queryCommandValue('fontSize') || "",
      textColor: document.queryCommandValue('foreColor') || "",
      backgroundColor: document.queryCommandValue('hiliteColor') || "",
      alignment: document.queryCommandState('justifyLeft') ? "left" : document.queryCommandState('justifyCenter') ? "center" : document.queryCommandState('justifyRight') ? "right" : document.queryCommandState('justifyFull') ? "justify" : "left"
    });
  }, []);

  // Restore selection before executing commands
  const restoreSelection = useCallback(() => {
    const rangeToRestore = selectionRef.current || selection;
    if (rangeToRestore && window.getSelection && editorRef.current) {
      // Focus the editor element first to ensure it can receive the selection
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel) {
        try {
          sel.removeAllRanges();
          sel.addRange(rangeToRestore.cloneRange());
          return true;
        } catch (e) {
          console.error("Error restoring selection:", e);
          return false;
        }
      }
    }
    return false;
  }, [selection]);

  // Ensure editorRef is focused when needed
  const focusEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Handle initial content and external value changes
  useEffect(() => {
    if (editorRef.current && !isFocused) {
      // Only update the innerHTML when not focused to avoid cursor jumping
      editorRef.current.innerHTML = value;
    }
  }, [value, isFocused]);

  // Execute rich text commands
  const execCommand = useCallback((command: string, value?: string) => {
    // Focus the editor first to ensure it's active
    focusEditor();

    // Restore the selection to where the user was working
    const selectionRestored = restoreSelection();

    // Only proceed if we successfully restored selection or if we're dealing with a command
    // that doesn't require selection like undo/redo
    if (selectionRestored || ['undo', 'redo', 'removeFormat'].includes(command)) {
      document.execCommand(command, false, value);

      // Save the updated content
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);

        // Give a small delay before attempting to save the new selection
        // This helps ensure the browser has fully processed the command
        setTimeout(() => {
          saveSelection();
        }, 10);
      }
    } else {
      // If we couldn't restore the selection, try to focus and retry once
      focusEditor();
      setTimeout(() => {
        if (restoreSelection()) {
          document.execCommand(command, false, value);
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            saveSelection();
          }
        }
      }, 10);
    }
  }, [onChange, restoreSelection, saveSelection, focusEditor]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          execCommand('undo');
          break;
        case 'y':
          e.preventDefault();
          execCommand('redo');
          break;
      }
    }

    // Don't save selection during key events as it might interfere with typing
    // We'll save it after input events instead
  }, [execCommand]);
  
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      // We should save selection after content is edited
      setTimeout(saveSelection, 0);
    }
  };
  
  const insertEmoji = (emojiData: EmojiClickData) => {
    focusEditor();
    restoreSelection();
    document.execCommand('insertText', false, emojiData.emoji);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      // Give a short delay to ensure the emoji is fully inserted before saving selection
      setTimeout(saveSelection, 10);
    }
    setShowEmojiPicker(false);
  };
  
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    execCommand('fontName', e.target.value);
  };
  
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    execCommand('fontSize', e.target.value);
  };

  // Track selection on mouseup, keyup and focus events
  const handleSelectionChange = useCallback(() => {
    if (editorRef.current && document.activeElement === editorRef.current) {
      saveSelection();
    }
  }, [saveSelection]);

  // Add document-wide listener for selection changes
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Handle mouseup events inside the editor
  const handleMouseUp = useCallback(() => {
    // We need to use setTimeout to ensure browser has finished its selection process
    setTimeout(saveSelection, 0);
  }, [saveSelection]);

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Give browser time to establish selection
    setTimeout(saveSelection, 0);
  }, [saveSelection]);

  // Handle blur events
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    handleInput();
  }, []);

  return (
    <div className="border border-input rounded-md overflow-hidden">
      <div className="border-b py-1 px-2 bg-muted/30">
        <div className="flex flex-wrap items-center gap-1">
          {/* Font Controls */}
          <div className="flex items-center mr-2 border-r pr-2">
            <select 
              className="h-8 bg-background border border-input rounded px-2 py-1 text-xs" 
              onChange={handleFontFamilyChange} 
              onClick={() => focusEditor()} 
              value={activeFormats.fontFamily}
            >
              <option value="">Font</option>
              {FONT_FAMILIES.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
            
            <select 
              className="h-8 ml-1 bg-background border border-input rounded px-2 py-1 text-xs" 
              onChange={handleFontSizeChange} 
              onClick={() => focusEditor()} 
              value={activeFormats.fontSize}
            >
              <option value="">Size</option>
              {FONT_SIZES.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          
          {/* Text Style Controls */}
          <div className="flex items-center mr-2 border-r pr-2">
            <button 
              type="button" 
              className={`p-1 rounded ${activeFormats.bold ? 'bg-muted-foreground/20' : 'hover:bg-muted-foreground/10'}`} 
              onClick={() => execCommand('bold')} 
              title="Bold (Ctrl+B)"
            >
              <Bold size={16} />
            </button>
            <button 
              type="button" 
              className={`p-1 rounded ${activeFormats.italic ? 'bg-muted-foreground/20' : 'hover:bg-muted-foreground/10'}`} 
              onClick={() => execCommand('italic')} 
              title="Italic (Ctrl+I)"
            >
              <Italic size={16} />
            </button>
            <button 
              type="button" 
              className={`p-1 rounded ${activeFormats.underline ? 'bg-muted-foreground/20' : 'hover:bg-muted-foreground/10'}`} 
              onClick={() => execCommand('underline')} 
              title="Underline (Ctrl+U)"
            >
              <Underline size={16} />
            </button>
            <button 
              type="button" 
              className={`p-1 rounded ${activeFormats.strikethrough ? 'bg-muted-foreground/20' : 'hover:bg-muted-foreground/10'}`} 
              onClick={() => execCommand('strikeThrough')} 
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </button>
          </div>
          
          {/* Heading Controls */}
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
          
          {/* Alignment Controls */}
          <div className="flex items-center mr-2 border-r pr-2">
            <button 
              type="button" 
              className={`p-1 rounded ${activeFormats.alignment === 'left' ? 'bg-muted-foreground/20' : 'hover:bg-muted-foreground/10'}`} 
              onClick={() => execCommand('justifyLeft')} 
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button 
              type="button" 
              className={`p-1 rounded ${activeFormats.alignment === 'center' ? 'bg-muted-foreground/20' : 'hover:bg-muted-foreground/10'}`} 
              onClick={() => execCommand('justifyCenter')} 
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button 
              type="button" 
              className={`p-1 rounded ${activeFormats.alignment === 'right' ? 'bg-muted-foreground/20' : 'hover:bg-muted-foreground/10'}`} 
              onClick={() => execCommand('justifyRight')} 
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
            <button 
              type="button" 
              className={`p-1 rounded ${activeFormats.alignment === 'justify' ? 'bg-muted-foreground/20' : 'hover:bg-muted-foreground/10'}`} 
              onClick={() => execCommand('justifyFull')} 
              title="Justify"
            >
              <AlignJustify size={16} />
            </button>
          </div>
          
          {/* List Controls */}
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
          
          {/* Color Controls Dropdown */}
          <div className="flex items-center mr-2 border-r pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  type="button" 
                  className="p-1 hover:bg-muted-foreground/10 rounded flex items-center gap-1" 
                  title="Text Color"
                >
                  <Palette size={16} />
                  <span className="text-xs">Colors</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="p-2 space-y-2">
                  <p className="text-xs font-medium mb-1">Text Color</p>
                  <div className="flex flex-wrap gap-1">
                    {TEXT_COLORS.map(color => (
                      <button 
                        key={color} 
                        type="button" 
                        className={`w-6 h-6 rounded-full border flex items-center justify-center hover:scale-110 transition-transform ${activeFormats.textColor === color ? 'ring-2 ring-offset-1 ring-primary' : 'border-input'}`} 
                        style={{ backgroundColor: color }} 
                        onClick={() => {
                          execCommand('foreColor', color);
                          document.body.click(); // Close dropdown
                        }} 
                        title={`Text color: ${color}`} 
                      />
                    ))}
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <p className="text-xs font-medium mb-1">Background Color</p>
                  <div className="flex flex-wrap gap-1">
                    {BACKGROUND_COLORS.map(color => (
                      <button 
                        key={color} 
                        type="button" 
                        className={`w-6 h-6 rounded-full border flex items-center justify-center hover:scale-110 transition-transform ${activeFormats.backgroundColor === color ? 'ring-2 ring-offset-1 ring-primary' : 'border-input'}`} 
                        style={{ backgroundColor: color }} 
                        onClick={() => {
                          execCommand('hiliteColor', color);
                          document.body.click(); // Close dropdown
                        }} 
                        title={`Background color: ${color}`} 
                      />
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Special Format Controls */}
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
          
          {/* Link and Emoji Controls */}
          <div className="flex items-center mr-2 border-r pr-2">
            <button 
              type="button" 
              className="p-1 hover:bg-muted-foreground/10 rounded" 
              onClick={() => {
                focusEditor();
                restoreSelection();
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
          
          {/* Utility Controls */}
          <div className="flex items-center">
            <button 
              type="button" 
              className="p-1 hover:bg-muted-foreground/10 rounded" 
              onClick={() => execCommand('undo')} 
              title="Undo (Ctrl+Z)"
            >
              <Undo size={16} />
            </button>
            <button 
              type="button" 
              className="p-1 hover:bg-muted-foreground/10 rounded" 
              onClick={() => execCommand('redo')} 
              title="Redo (Ctrl+Y)"
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
      </div>
      
      <div 
        ref={editorRef}
        className="min-h-32 p-3 focus:outline-none" 
        contentEditable 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        onInput={handleInput} 
        onMouseUp={handleMouseUp} 
        onKeyUp={() => setTimeout(saveSelection, 0)} 
        onKeyDown={handleKeyDown} 
        aria-placeholder={placeholder} 
        data-placeholder={placeholder} 
      />
      
      {!value && !isFocused && (
        <div 
          className="absolute pointer-events-none text-muted-foreground p-3" 
          style={{ marginTop: '-8rem' }}
        >
          {placeholder}
        </div>
      )}

      <style jsx>{`
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
