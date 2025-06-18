
import React, { useState, useMemo } from "react";
import { Search, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  onAddNew?: (name: string) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

export function SelectWithCustomOption({
  options = [],
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
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!search || !Array.isArray(options)) return options || [];
    return options.filter(option => 
      option?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleAddNew = async () => {
    if (!newItemName.trim() || !onAddNew) return;
    
    setIsAdding(true);
    try {
      await onAddNew(newItemName.trim());
      setNewItemName("");
      setIsAddingNew(false);
      setSearch("");
    } catch (error) {
      console.error("Error adding new item:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setNewItemName("");
  };

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "__ADD_NEW__") {
      setIsAddingNew(true);
      return;
    }
    onValueChange(selectedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNew();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const selectedOption = options?.find(option => option?.id === value);

  // If we're in "adding new" mode, show the input field
  if (isAddingNew) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Input
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder={addNewPlaceholder}
          disabled={isAdding}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1"
        />
        <Button
          onClick={handleAddNew}
          disabled={!newItemName.trim() || isAdding}
          size="sm"
          className="px-3"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleCancel}
          variant="outline"
          size="sm"
          className="px-3"
          disabled={isAdding}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Select value={value} onValueChange={handleSelectChange} disabled={disabled}>
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
            {filteredOptions?.map((item) => {
              if (!item) return null;
              return (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              );
            })}
            
            {filteredOptions?.length === 0 && search && (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No options found
              </div>
            )}

            {/* Add New Option */}
            {onAddNew && (
              <SelectItem value="__ADD_NEW__" className="font-medium text-primary">
                + {addNewLabel}
              </SelectItem>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
