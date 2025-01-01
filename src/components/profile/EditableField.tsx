import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EditableFieldProps {
  label: string;
  value: string | null;
  fieldName: string;
  profileId: string;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
}

export function EditableField({ 
  label, 
  value, 
  fieldName, 
  profileId,
  readOnly = false,
  className = '',
  placeholder = ''
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value || '');
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [fieldName]: editedValue })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Field updated successfully',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: 'Error',
        description: 'Failed to update field',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setEditedValue(value || '');
    setIsEditing(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Input
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              className="flex-1"
              placeholder={placeholder}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              className="h-8 w-8"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
              {value || placeholder}
            </span>
            {!readOnly && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}