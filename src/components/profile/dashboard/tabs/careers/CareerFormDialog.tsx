
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CareerForm } from './CareerForm';

interface CareerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  career?: any;
}

export function CareerFormDialog({ open, onClose, onSuccess, career }: CareerFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {career ? 'Edit Career' : 'Add New Career'}
          </DialogTitle>
        </DialogHeader>
        <CareerForm
          career={career}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
