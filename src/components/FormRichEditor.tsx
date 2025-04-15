
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";

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
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("formatting");
  const [selection, setSelection] = useState<Range | null>(null);
  const [isTextSelected, setIsTextSelected] = useState(false);
  const selectionRef = useRef<Range | null>(null);
  const commandInProgressRef = useRef(false);
  const pendingSelectionSave = useRef(false);
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
  
  // Function to safely save the current selection with enhanced reliability
  const saveSelection = useCallback(() => {
    // If we're in the middle of a command execution, don't update the selection
    if (commandInProgressRef.current) return null;
    
    if (window.getSelection && document.createRange) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        
        // Only save the selection if it's within our editor
        if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
          const savedRange = range.cloneRange();
          setSelection(savedRange);
          selectionRef.current = savedRange;
          setIsTextSelected(!range.collapsed);

          // Check active formatting for the current selection
          setTimeout(() => {
            if (document.activeElement === editorRef.current) {
              checkActiveFormats(sel);
            }
          }, 50);
          
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
      alignment: document.queryCommandState('justifyLeft') ? "left" :
                document.queryCommandState('justifyCenter') ? "center" :
                document.queryCommandState('justifyRight') ? "right" :
                document.queryCommandState('justifyFull') ? "justify" : "left"
    });
  }, []);
  
  // Enhanced restore selection with retry mechanism
  const restoreSelection = useCallback(() => {
    const rangeToRestore = selectionRef.current || selection;
    
    if (!rangeToRestore || !window.getSelection || !editorRef.current) {
      return false;
    }
    
    // Try to restore selection
    const tryRestore = () => {
      try {
        // Focus the editor element first to ensure it can receive the selection
        if (document.activeElement !== editorRef.current) {
          editorRef.current.focus();
        }
        
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(rangeToRestore.cloneRange());
          return true;
        }
      } catch (e) {
        console.error("Error restoring selection:", e);
      }
      return false;
    };
    
    // Try to restore immediately
    const restored = tryRestore();
    
    // If failed, try again after a short delay
    if (!restored) {
      setTimeout(() => {
        tryRestore();
      }, 10);
      return false;
    }
    
    return restored;
  }, [selection]);
  
  // Ensure editorRef is focused when needed
  const focusEditor = useCallback(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus();
      return true;
    }
    return false;
  }, []);

  // Handle initial content and external value changes
  useEffect(() => {
    if (editorRef.current && !isFocused) {
      // Only update the innerHTML when not focused to avoid cursor jumping
      editorRef.current.innerHTML = value;
    }
  }, [value, isFocused]);

  // Execute rich text commands with enhanced reliability
  const execCommand = useCallback((command: string, value?: string) => {
    // Set flag to indicate command execution is in progress
    commandInProgressRef.current = true;
    
    // Focus the editor first to ensure it's active
    focusEditor();
    
    // Short delay to ensure focus is established
    setTimeout(() => {
      // Restore the selection to where the user was working
      const selectionRestored = restoreSelection();
      
      // Only proceed if we successfully restored selection or if we're dealing with a command
      // that doesn't require selection like undo/redo
      if (selectionRestored || ['undo', 'redo', 'removeFormat'].includes(command)) {
        document.execCommand(command, false, value);
        
        // Save the updated content with a small delay
        setTimeout(() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            
            // Wait a moment before saving the new selection
            // This helps ensure the browser has fully processed the command
            setTimeout(() => {
              commandInProgressRef.current = false;
              if (document.activeElement === editorRef.current) {
                saveSelection();
              }
            }, 50);
          } else {
            commandInProgressRef.current = false;
          }
        }, 10);
      } else {
        // If we couldn't restore the selection, try to focus and retry once
        focusEditor();
        setTimeout(() => {
          if (restoreSelection()) {
            document.execCommand(command, false, value);
            if (editorRef.current) {
              onChange(editorRef.current.innerHTML);
              setTimeout(() => {
                commandInProgressRef.current = false;
                saveSelection();
              }, 50);
            } else {
              commandInProgressRef.current = false;
            }
          } else {
            commandInProgressRef.current = false;
          }
        }, 50);
      }
    }, 0);
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
  }, [execCommand]);
  
  // Handle input event - called when editor content changes
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      
      // Don't save selection during command execution
      if (!commandInProgressRef.current) {
        // Mark that we need to save selection
        pendingSelectionSave.current = true;
        
        // Defer selection saving to next tick to avoid conflicts
        setTimeout(() => {
          if (pendingSelectionSave.current && document.activeElement === editorRef.current) {
            pendingSelectionSave.current = false;
            saveSelection();
          }
        }, 0);
      }
    }
  };
  
  // Insert emoji at current cursor position
  const insertEmoji = (emojiData: EmojiClickData) => {
    focusEditor();
    
    // Set the command flag to prevent selection changes
    commandInProgressRef.current = true;
    
    setTimeout(() => {
      restoreSelection();
      document.execCommand('insertText', false, emojiData.emoji);
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
        // Give a short delay to ensure the emoji is fully inserted before saving selection
        setTimeout(() => {
          commandInProgressRef.current = false;
          saveSelection();
          setShowEmojiPicker(false);
        }, 50);
      } else {
        commandInProgressRef.current = false;
        setShowEmojiPicker(false);
      }
    }, 10);
  };
  
  // Handle font family selection
  const handleFontFamilyChange = (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.getAttribute('data-value');
    if (value) {
      execCommand('fontName', value);
    }
  };
  
  // Handle font size selection
  const handleFontSizeChange = (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.getAttribute('data-value');
    if (value) {
      execCommand('fontSize', value);
    }
  };

  // Track selection on mouseup, keyup and focus events
  const handleSelectionChange = useCallback(() => {
    if (editorRef.current && document.activeElement === editorRef.current) {
      // If no command is in progress, save the selection
      if (!commandInProgressRef.current) {
        pendingSelectionSave.current = true;
        
        // Defer to avoid race conditions
        setTimeout(() => {
          if (pendingSelectionSave.current && document.activeElement === editorRef.current) {
            pendingSelectionSave.current = false;
            saveSelection();
          }
        }, 10);
      }
    }
  }, [saveSelection]);

  // Add document-wide listener for selection changes
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      // Clear any pending operations
      commandInProgressRef.current = false;
      pendingSelectionSave.current = false;
      selectionRef.current = null;
    };
  }, []);

  // Handle mouseup events inside the editor
  const handleMouseUp = useCallback(() => {
    // Only save selection if no command is in progress
    if (!commandInProgressRef.current) {
      pendingSelectionSave.current = true;
      setTimeout(() => {
        if (pendingSelectionSave.current && document.activeElement === editorRef.current) {
          pendingSelectionSave.current = false;
          saveSelection();
        }
      }, 10);
    }
  }, [saveSelection]);
  
  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Give browser time to establish selection
    if (!commandInProgressRef.current) {
      setTimeout(() => {
        if (document.activeElement === editorRef.current) {
          saveSelection();
        }
      }, 50);
    }
  }, [saveSelection]);
  
  // Handle blur events
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Only blur if the focus is leaving the editor container completely
    if (editorContainerRef.current && !editorContainerRef.current.contains(e.relatedTarget as Node)) {
      setIsFocused(false);
      handleInput();
    }
  }, []);

  // Handle click on formatting toolbar without losing focus
  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    // Prevent default to avoid losing focus
    e.preventDefault();
  };
  
  // Create a dropdown for font family selection
  const FontFamilyDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-8 px-2 py-1 text-xs justify-between min-w-32"
        >
          {activeFormats.fontFamily || "Font Family"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
        {FONT_FAMILIES.map((font) => (
          <DropdownMenuItem
            key={font}
            onClick={handleFontFamilyChange}
            data-value={font}
            style={{ fontFamily: font }}
          >
            {font}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Create a dropdown for font size selection
  const FontSizeDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-8 px-2 py-1 text-xs justify-between ml-1 min-w-16"
        >
          {activeFormats.fontSize || "Size"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {FONT_SIZES.map((size) => (
          <DropdownMenuItem
            key={size}
            onClick={handleFontSizeChange}
            data-value={size}
          >
            {size}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  return (
    <div 
      ref={editorContainerRef}
      className="border border-input rounded-md"
      onMouseDown={(e) => {
        // If clicking anywhere in the container, ensure we maintain focus
        if (editorRef.current && document.activeElement !== editorRef.current) {
          // Don't focus immediately to avoid conflict with button clicks
          setTimeout(() => {
            if (editorRef.current) editorRef.current.focus();
          }, 0);
        }
      }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList 
          className="w-full bg-muted justify-start h-auto flex-wrap border-b rounded-none" 
          onMouseDown={handleToolbarMouseDown}
        >
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
        
        <TabsContent 
          value="formatting" 
          className="p-1 space-y-1 border-b"
          onMouseDown={handleToolbarMouseDown}
        >
          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center mr-2 border-r pr-2">
              <FontFamilyDropdown />
              <FontSizeDropdown />
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
        
        <TabsContent 
          value="alignment" 
          className="p-1 space-y-1 border-b"
          onMouseDown={handleToolbarMouseDown}
        >
          <div className="flex items-center gap-1">
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
        </TabsContent>
        
        <TabsContent 
          value="colors" 
          className="p-1 space-y-1 border-b"
          onMouseDown={handleToolbarMouseDown}
        >
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium mb-1">Text Color</p>
              <div className="flex flex-wrap gap-1">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full border flex items-center justify-center hover:scale-110 transition-transform ${activeFormats.textColor === color ? 'ring-2 ring-offset-1 ring-primary' : 'border-input'}`}
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
                    className={`w-6 h-6 rounded-full border flex items-center justify-center hover:scale-110 transition-transform ${activeFormats.backgroundColor === color ? 'ring-2 ring-offset-1 ring-primary' : 'border-input'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => execCommand('hiliteColor', color)}
                    title={`Background color: ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent 
          value="advanced" 
          className="p-1 space-y-1 border-b"
          onMouseDown={handleToolbarMouseDown}
        >
          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center mr-2 border-r pr-2">
              <button
                type="button"
                className={`p-1 rounded hover:bg-muted-foreground/10`}
                onClick={() => execCommand('superscript')}
                title="Superscript"
              >
                <Superscript size={16} />
              </button>
              <button
                type="button"
                className={`p-1 rounded hover:bg-muted-foreground/10`}
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
                  // Set command flag to true to prevent selection changing
                  commandInProgressRef.current = true;
                  
                  focusEditor();
                  setTimeout(() => {
                    restoreSelection();
                    const url = prompt('Enter URL:');
                    
                    if (url) {
                      // Execute after a short delay to ensure everything is ready
                      setTimeout(() => {
                        // Try to restore selection again just before executing
                        restoreSelection();
                        document.execCommand('createLink', false, url);
                        
                        // Update content and selection
                        if (editorRef.current) {
                          onChange(editorRef.current.innerHTML);
                          
                          // Reset command flag and save selection
                          setTimeout(() => {
                            commandInProgressRef.current = false;
                            saveSelection();
                          }, 50);
                        } else {
                          commandInProgressRef.current = false;
                        }
                      }, 0);
                    } else {
                      // Reset command flag if no URL was entered
                      commandInProgressRef.current = false;
                    }
                  }, 0);
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
                    onClick={() => {
                      // Save selection before opening the emoji picker
                      saveSelection();
                    }}
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
        </TabsContent>
      </Tabs>
      
      <div 
        ref={editorRef}
        className="min-h-32 p-3 focus:outline-none"
        contentEditable
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        onMouseUp={handleMouseUp}
        onKeyUp={() => {
          if (!commandInProgressRef.current && document.activeElement === editorRef.current) {
            pendingSelectionSave.current = true;
            setTimeout(() => {
              if (pendingSelectionSave.current && document.activeElement === editorRef.current) {
                pendingSelectionSave.current = false;
                saveSelection();
              }
            }, 10);
          }
        }}
        onKeyDown={handleKeyDown}
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

      <style jsx global>
        {`
          [contenteditable] {
            outline: none;
          }
          
          [data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #a9a9a9;
            font-style: italic;
          }
        `}
      </style>
    </div>
  );
}
