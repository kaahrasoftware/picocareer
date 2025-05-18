
import { useState } from "react";
import { useSchoolMajors } from "@/hooks/useAllSchools";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Define the schema for the form
const schoolMajorSchema = z.object({
  major_id: z.string().min(1, "Please select a major"),
  program_details: z.string().optional(),
  program_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type SchoolMajorFormValues = z.infer<typeof schoolMajorSchema>;

interface SchoolMajorsManagerProps {
  schoolId: string;
}

export function SchoolMajorsManager({ schoolId }: SchoolMajorsManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [majors, setMajors] = useState<any[]>([]);
  const [majorsFetched, setMajorsFetched] = useState(false);
  const { data: schoolMajors, isLoading: isLoadingSchoolMajors, refetch } = useSchoolMajors(schoolId);
  const { toast } = useToast();

  const form = useForm<SchoolMajorFormValues>({
    resolver: zodResolver(schoolMajorSchema),
    defaultValues: {
      major_id: "",
      program_details: "",
      program_url: "",
    },
  });

  const fetchMajors = async () => {
    if (majorsFetched) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("majors")
        .select("id, title")
        .order("title");
      
      if (error) throw error;
      setMajors(data || []);
      setMajorsFetched(true);
    } catch (error) {
      console.error("Error fetching majors:", error);
      toast({
        title: "Error",
        description: "Failed to load majors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = () => {
    setIsAddDialogOpen(true);
    fetchMajors();
  };

  const handleSubmit = async (values: SchoolMajorFormValues) => {
    setLoading(true);

    try {
      // Check if the relationship already exists
      const { data: existingRelation } = await supabase
        .from("school_majors")
        .select("*")
        .eq("school_id", schoolId)
        .eq("major_id", values.major_id)
        .single();

      if (existingRelation) {
        toast({
          title: "Duplicate Entry",
          description: "This major is already associated with this school.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Insert new relation
      const { error } = await supabase.from("school_majors").insert({
        school_id: schoolId,
        major_id: values.major_id,
        program_details: values.program_details,
        program_url: values.program_url,
      });

      if (error) throw error;

      toast({
        title: "Major Added",
        description: "The major has been successfully added to this school.",
      });

      form.reset();
      setIsAddDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error adding major to school:", error);
      toast({
        title: "Error",
        description: "Failed to add major. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMajor = async (majorRelationId: string) => {
    try {
      const { error } = await supabase
        .from("school_majors")
        .delete()
        .eq("id", majorRelationId);

      if (error) throw error;

      toast({
        title: "Major Removed",
        description: "The major has been removed from this school.",
      });

      refetch();
    } catch (error) {
      console.error("Error removing major:", error);
      toast({
        title: "Error",
        description: "Failed to remove major. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Available Majors & Programs</h3>
        <Button onClick={handleDialogOpen}>
          <Plus className="h-4 w-4 mr-2" />
          Add Major
        </Button>
      </div>

      <div className="space-y-4">
        {isLoadingSchoolMajors ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : schoolMajors && schoolMajors.length > 0 ? (
          <div className="grid gap-4 grid-cols-1">
            {schoolMajors.map((relation: any) => (
              <Card key={relation.id} className="overflow-hidden">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="text-base font-medium">{relation.majors.title}</h4>
                    {relation.program_details && (
                      <p className="text-sm text-muted-foreground">{relation.program_details}</p>
                    )}
                    {relation.program_url && (
                      <a 
                        href={relation.program_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-primary hover:underline flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="h-3.5 w-3.5 mr-1" />
                        View Program
                      </a>
                    )}
                  </div>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveMajor(relation.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No majors have been added to this school yet.</p>
            <p className="text-sm">Click "Add Major" to associate majors with this school.</p>
          </div>
        )}
      </div>

      {/* Add Major Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Major to School</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="major_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Major*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a major" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loading ? (
                          <div className="flex justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          majors.map((major) => (
                            <SelectItem key={major.id} value={major.id}>
                              {major.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="program_details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Details</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., Bachelor of Science, 4 years"
                        disabled={loading} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="program_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    "Add Major"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Globe(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}
