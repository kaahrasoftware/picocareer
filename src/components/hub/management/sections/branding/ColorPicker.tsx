
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Palette } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { BRAND_COLORS } from "./constants";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  description: string;
}

export function ColorPicker({ value, onChange, label, description }: ColorPickerProps) {
  const { toast } = useToast();

  const handleColorChange = (newColor: string) => {
    onChange(newColor);
  };

  const handleCopyHex = (hexCode: string) => {
    navigator.clipboard.writeText(hexCode);
    toast({
      title: "Copied!",
      description: `Color code ${hexCode} copied to clipboard`,
      duration: 2000,
    });
  };

  return (
    <div className="space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {label}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex gap-2 items-center">
            <div
              className="w-12 h-10 rounded-lg border cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              style={{ backgroundColor: value }}
            />
            <div className="relative flex-1">
              <Input
                value={value}
                readOnly
                className="w-[120px] font-mono uppercase pr-8 text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                onClick={() => handleCopyHex(value)}
              >
                <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4">
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="w-full mb-4 grid grid-cols-2">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom" className="mt-0">
              <div className="space-y-4">
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full h-40 cursor-pointer"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="presets" className="mt-0">
              <div className="space-y-4">
                {Object.entries(BRAND_COLORS).map(([category, colors]) => (
                  <div key={category}>
                    <div className="text-sm font-medium mb-2 capitalize text-muted-foreground">
                      {category}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {colors.map((color) => (
                        <TooltipProvider key={color.value}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => handleColorChange(color.value)}
                                className={cn(
                                  "w-full aspect-square rounded-lg border relative group transition-all hover:scale-110",
                                  value === color.value && "ring-2 ring-primary ring-offset-2"
                                )}
                                style={{ backgroundColor: color.value }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 bg-white/90 hover:bg-white/100 transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyHex(color.value);
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">{color.name}</p>
                              <p className="font-mono text-xs text-muted-foreground">{color.value}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}
