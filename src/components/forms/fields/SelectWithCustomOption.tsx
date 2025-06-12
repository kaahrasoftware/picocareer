
import React, { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface SelectOption {
  id: string;
  name: string;
}

interface SelectWithCustomOptionProps {
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  addNewLabel?: string;
  addNewPlaceholder?: string;
  onAddNew?: (name: string) => Promise<string>;
  className?: string;
  disabled?: boolean;
}

export function SelectWithCustomOption({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search options...",
  addNewLabel = "Add New",
  addNewPlaceholder = "Enter new option name",
  onAddNew,
  className,
  disabled = false
}: SelectWithCustomOptionProps) {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter(option => 
      option?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleAddNew = async () => {
    if (!newItemName.trim() || !onAddNew) return;
    
    setIsAdding(true);
    try {
      const newId = await onAddNew(newItemName.trim());
      if (newId) {
        onValueChange(newId);
      }
      setNewItemName("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding new item:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const selectedOption = options.find(option => option?.id === value);

  return (
    <div className={className}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder}>
            {selectedOption?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.map((item) => {
              if (!item) return null;
              return (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              );
            })}
            
            {filteredOptions.length === 0 && search && (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No options found
              </div>
            )}
          </div>

          {/* Add New Button */}
          {onAddNew && (
            <div className="p-2 border-t">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {addNewLabel}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{addNewLabel}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="new-item-name">Name</Label>
                      <Input
                        id="new-item-name"
                        placeholder={addNewPlaceholder}
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddNew();
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddNew} 
                        disabled={!newItemName.trim() || isAdding}
                        className="flex-1"
                      >
                        {isAdding ? "Adding..." : "Add"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
