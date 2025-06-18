
import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
}

interface SelectWithCustomOptionProps {
  value?: string;
  onValueChange: (value: string) => void;
  fieldName: string;
  placeholder?: string;
  disabled?: boolean;
}

const fieldToTableMap: Record<string, { table: string; titleField: string; createField: string }> = {
  academic_major_id: { table: 'majors', titleField: 'title', createField: 'title' },
  school_id: { table: 'schools', titleField: 'name', createField: 'name' },
  position: { table: 'careers', titleField: 'title', createField: 'title' },
  company_id: { table: 'companies', titleField: 'name', createField: 'name' }
};

export function SelectWithCustomOption({ 
  value, 
  onValueChange, 
  fieldName, 
  placeholder = "Select option...",
  disabled 
}: SelectWithCustomOptionProps) {
  const [open, setOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fieldConfig = fieldToTableMap[fieldName];

  const { data: options = [], isLoading } = useQuery({
    queryKey: ['field-options', fieldName, searchQuery],
    queryFn: async () => {
      if (!fieldConfig) return [];
      
      try {
        let query = supabase
          .from(fieldConfig.table as any)
          .select(`id, ${fieldConfig.titleField}`)
          .eq('status', 'Approved')
          .order(fieldConfig.titleField);

        if (searchQuery && searchQuery.length >= 2) {
          query = query.ilike(fieldConfig.titleField, `%${searchQuery}%`);
        }

        const { data, error } = await query.limit(100);
        
        if (error) {
          console.error('Error fetching options:', error);
          return [];
        }
        
        if (!data || !Array.isArray(data)) {
          return [];
        }

        return data
          .filter((item): item is Record<string, any> => {
            return item !== null && 
                   typeof item === 'object' && 
                   'id' in item &&
                   fieldConfig.titleField in item;
          })
          .map(item => ({
            id: item.id,
            name: item[fieldConfig.titleField] || ''
          }))
          .filter((item): item is Option => 
            item.id !== null && 
            item.id !== undefined && 
            item.name !== ''
          );
      } catch (error) {
        console.error('Query error:', error);
        return [];
      }
    },
    enabled: !!fieldConfig
  });

  const filteredOptions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return options;
    
    return options.filter(option => 
      option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!fieldConfig) throw new Error('Invalid field configuration');

      const { data, error } = await supabase
        .from(fieldConfig.table as any)
        .insert({ [fieldConfig.createField]: name })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['field-options', fieldName] });
      onValueChange(data.id);
      setIsDialogOpen(false);
      setNewItemName("");
      toast({
        title: "Success",
        description: "New item created successfully!",
      });
    },
    onError: (error) => {
      console.error("Error creating item:", error);
      toast({
        title: "Error",
        description: "Failed to create new item. Please try again.",
        variant: "destructive",
      });
    }
  });

  const selectedOption = options.find(option => option.id === value);

  const handleCreateNew = () => {
    if (!newItemName.trim()) return;
    createMutation.mutate(newItemName.trim());
  };

  if (!fieldConfig) {
    return null;
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedOption ? selectedOption.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder={`Search ${fieldConfig.titleField}...`}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandEmpty>
              {isLoading ? "Loading..." : "No options found."}
            </CommandEmpty>
            <CommandList>
              <CommandGroup className="max-h-64 overflow-auto">
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.id}
                    onSelect={() => {
                      onValueChange(value === option.id ? "" : option.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.name}
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={() => {
                    setIsDialogOpen(true);
                    setOpen(false);
                  }}
                  className="border-t"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add new {fieldConfig.titleField}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {fieldConfig.titleField}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-item-name">{fieldConfig.titleField}</Label>
              <Input
                id="new-item-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`Enter ${fieldConfig.titleField}...`}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateNew}
                disabled={!newItemName.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
