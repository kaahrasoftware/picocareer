
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface EventRegistrationDialogProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  onRegistrationSuccess: () => void;
}

export function EventRegistrationDialog({ 
  event, 
  isOpen, 
  onClose, 
  onRegistrationSuccess 
}: EventRegistrationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    country: '',
    'current school/company': '',
    'current academic field/position': '',
    student_or_professional: '',
    'where did you hear about us': ''
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          profile_id: user?.id,
          ...formData
        });

      if (error) throw error;

      onRegistrationSuccess();
      toast({
        title: "Registration Successful",
        description: "You have been registered for the event!",
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for event.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register for {event.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="current_school_company">Current School/Company</Label>
            <Input
              id="current_school_company"
              value={formData['current school/company']}
              onChange={(e) => handleInputChange('current school/company', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="academic_field">Current Academic Field/Position *</Label>
            <Input
              id="academic_field"
              value={formData['current academic field/position']}
              onChange={(e) => handleInputChange('current academic field/position', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="student_professional">Are you a student or professional? *</Label>
            <Select 
              value={formData.student_or_professional}
              onValueChange={(value) => handleInputChange('student_or_professional', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="how_heard">Where did you hear about us?</Label>
            <Select 
              value={formData['where did you hear about us']}
              onValueChange={(value) => handleInputChange('where did you hear about us', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Friend/Family">Friend/Family</SelectItem>
                <SelectItem value="Search Engine">Search Engine</SelectItem>
                <SelectItem value="Advertisement">Advertisement</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Register
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
