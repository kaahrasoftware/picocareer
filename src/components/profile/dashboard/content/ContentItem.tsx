import { ContentStatus } from "../types";
import { StatusSelect } from "./StatusSelect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { majorFormFields } from "@/components/forms/major/MajorFormFields";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatMajorData } from "@/utils/majorFormatting";

interface ContentItemProps {
  item: any;
  handleStatusChange: (itemId: string, newStatus: ContentStatus) => Promise<void>;
  getStatusColor: (status: ContentStatus) => string;
}

export function ContentItem({ item, handleStatusChange, getStatusColor }: ContentItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Transform array data for form fields
  const prepareFieldData = (field: any, value: any) => {
    if (field.type === "array" && Array.isArray(value)) {
      return value.join(", ");
    }
    return value;
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      console.log('Updating major:', data);

      const formattedData = formatMajorData(data);
      
      const { error } = await supabase
        .from('majors')
        .update(formattedData)
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Major updated successfully",
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating major:', error);
      toast({
        title: "Error",
        description: "Failed to update major. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    await handleStatusChange(item.id, "Approved");
    toast({
      title: "Success",
      description: "Content has been approved",
    });
  };

  const handleReject = async () => {
    await handleStatusChange(item.id, "Rejected");
    toast({
      title: "Status Updated",
      description: "Content has been rejected",
    });
  };

  return (
    <>
      <div 
        className="bg-muted p-4 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">{item.title}</h4>
          <div className="flex items-center gap-2">
            <StatusSelect
              status={item.status || "Pending"}
              onStatusChange={(value) => handleStatusChange(item.id, value)}
              getStatusColor={getStatusColor}
            />
          </div>
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground mb-2">
            {item.description}
          </p>
        )}
        <div className="text-xs text-muted-foreground">
          Created: {new Date(item.created_at).toLocaleDateString()}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Major: {item.title}</DialogTitle>
          </DialogHeader>
          
          <GenericUploadForm
            fields={majorFormFields.map(field => ({
              ...field,
              defaultValue: prepareFieldData(field, item[field.name])
            }))}
            onSubmit={handleSubmit}
            buttonText="Update Major"
            isSubmitting={isSubmitting}
          />

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={item.status === "Rejected"}
            >
              Reject
            </Button>
            <Button
              variant="default"
              onClick={handleApprove}
              disabled={item.status === "Approved"}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}