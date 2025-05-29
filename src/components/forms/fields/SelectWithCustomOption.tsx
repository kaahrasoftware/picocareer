
import React, { useState, useEffect } from 'react';
import { UseFormReturn, FieldPath } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type SelectOption = {
  id: string;
  title?: string;
  name?: string;
};

interface SelectWithCustomOptionProps<T extends Record<string, any>> {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  tableName: string;
  displayField: 'title' | 'name';
  required?: boolean;
  multiple?: boolean;
  allowCustom?: boolean;
  customPlaceholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  maxSelections?: number;
}

export function SelectWithCustomOption<T extends Record<string, any>>({
  form,
  name,
  label,
  placeholder = "Select an option...",
  description,
  tableName,
  displayField,
  required = false,
  multiple = false,
  allowCustom = true,
  customPlaceholder = "Add new option...",
  searchPlaceholder = "Search options...",
  className,
  disabled = false,
  maxSelections
}: SelectWithCustomOptionProps<T>) {
  const [customValue, setCustomValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const { toast } = useToast();

  const currentValue = form.watch(name);

  // Fetch options from database
  const { data: dbOptions = [], isLoading, error } = useQuery({
    queryKey: ['select-options', tableName, displayField],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select(`id, ${displayField}`)
          .eq('status', 'Approved')
          .order(displayField);

        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
          throw error;
        }

        return (data || []).map(item => ({
          id: item.id,
          ...(displayField === 'title' ? { title: item.title } : { name: item.name })
        }));
      } catch (error) {
        console.error(`Failed to fetch options from ${tableName}:`, error);
        return [];
      }
    },
    retry: 1
  });

  // Update local options when db options change
  useEffect(() => {
    if (dbOptions) {
      setOptions(dbOptions);
    }
  }, [dbOptions]);

  // Filter options based on search query
  const filteredOptions = options.filter(option => {
    const displayValue = option[displayField] || '';
    return displayValue.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddCustomOption = async () => {
    if (!customValue.trim()) return;

    setIsAddingCustom(true);
    try {
      const newOption = {
        [displayField]: customValue.trim(),
        status: 'Approved'
      };

      const { data, error } = await supabase
        .from(tableName)
        .insert([newOption])
        .select(`id, ${displayField}`)
        .single();

      if (error) throw error;

      const formattedOption: SelectOption = {
        id: data.id,
        ...(displayField === 'title' ? { title: data.title } : { name: data.name })
      };

      // Update local options list
      setOptions(prev => [...prev, formattedOption]);

      // Update form value
      if (multiple) {
        const currentValues = Array.isArray(currentValue) ? currentValue : [];
        form.setValue(name, [...currentValues, data.id] as any);
      } else {
        form.setValue(name, data.id as any);
      }

      setCustomValue('');
      toast({
        title: "Option added",
        description: `"${customValue.trim()}" has been added successfully.`
      });
    } catch (error) {
      console.error('Error adding custom option:', error);
      toast({
        title: "Error",
        description: "Failed to add custom option. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAddingCustom(false);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (multiple) {
      const currentValues = Array.isArray(currentValue) ? currentValue : [];
      
      if (currentValues.includes(optionId)) {
        // Remove if already selected
        form.setValue(name, currentValues.filter(id => id !== optionId) as any);
      } else {
        // Add if not selected (check max selections)
        if (maxSelections && currentValues.length >= maxSelections) {
          toast({
            title: "Selection limit reached",
            description: `You can only select up to ${maxSelections} options.`,
            variant: "destructive"
          });
          return;
        }
        form.setValue(name, [...currentValues, optionId] as any);
      }
    } else {
      form.setValue(name, optionId as any);
    }
  };

  const handleRemoveSelection = (optionId: string) => {
    if (multiple) {
      const currentValues = Array.isArray(currentValue) ? currentValue : [];
      form.setValue(name, currentValues.filter(id => id !== optionId) as any);
    } else {
      form.setValue(name, '' as any);
    }
  };

  const getSelectedOptions = () => {
    if (!currentValue) return [];
    const selectedIds = Array.isArray(currentValue) ? currentValue : [currentValue];
    return options.filter(option => selectedIds.includes(option.id));
  };

  const selectedOptions = getSelectedOptions();

  if (error) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={name}>{label} {required && <span className="text-red-500">*</span>}</Label>
        <div className="text-sm text-red-600">
          Error loading options. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>{label} {required && <span className="text-red-500">*</span>}</Label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                disabled={disabled}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Selected Options Display */}
          {selectedOptions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedOptions.map((option) => (
                  <Badge key={option.id} variant="secondary" className="flex items-center gap-1">
                    {option[displayField]}
                    {!disabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveSelection(option.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Options List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm">Loading options...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchQuery ? 'No matching options found.' : 'No options available.'}
                </p>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = multiple 
                    ? (Array.isArray(currentValue) ? currentValue : []).includes(option.id)
                    : currentValue === option.id;
                  
                  return (
                    <Button
                      key={option.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => handleSelectOption(option.id)}
                      disabled={disabled}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{option[displayField]}</div>
                      </div>
                      {isSelected && <span className="ml-2">✓</span>}
                    </Button>
                  );
                })
              )}
            </div>
          )}

          {/* Add Custom Option */}
          {allowCustom && !disabled && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-sm font-medium">Add Custom Option:</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={customPlaceholder}
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomOption();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddCustomOption}
                  disabled={!customValue.trim() || isAddingCustom}
                  size="sm"
                >
                  {isAddingCustom ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {/* Selection Info */}
          {multiple && maxSelections && (
            <p className="text-xs text-muted-foreground">
              {selectedOptions.length} of {maxSelections} options selected
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
