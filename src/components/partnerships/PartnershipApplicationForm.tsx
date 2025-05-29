
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";
import type { PartnershipFormData } from "@/types/partnership";
import { ENTITY_TYPES, PARTNERSHIP_TYPES } from "@/types/partnership";

export function PartnershipApplicationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PartnershipFormData>({
    entity_type: 'organization',
    entity_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    description: '',
    partnership_goals: '',
    student_count: '',
    geographic_location: '',
    preferred_partnership_type: [],
    additional_info: ''
  });

  const handleInputChange = (field: keyof PartnershipFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePartnershipTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferred_partnership_type: checked
        ? [...prev.preferred_partnership_type, type]
        : prev.preferred_partnership_type.filter(t => t !== type)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        entity_type: formData.entity_type,
        entity_name: formData.entity_name,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone || null,
        website: formData.website || null,
        description: formData.description,
        partnership_goals: formData.partnership_goals,
        student_count: formData.student_count ? parseInt(formData.student_count) : null,
        geographic_location: formData.geographic_location || null,
        preferred_partnership_type: formData.preferred_partnership_type.length > 0 ? formData.preferred_partnership_type : null,
        additional_info: formData.additional_info || null
      };

      const { error } = await supabase
        .from('partnerships')
        .insert([submitData]);

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest in partnering with PicoCareer. We'll review your application and get back to you soon.",
      });

      // Reset form
      setFormData({
        entity_type: 'organization',
        entity_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        description: '',
        partnership_goals: '',
        student_count: '',
        geographic_location: '',
        preferred_partnership_type: [],
        additional_info: ''
      });

    } catch (error) {
      console.error('Error submitting partnership application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.entity_name && formData.contact_name && 
                    formData.contact_email && formData.description && 
                    formData.partnership_goals;

  return (
    <section id="partnership-form" className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Apply for Partnership</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ready to partner with us? Fill out the form below and we'll get back to you within 48 hours.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Partnership Application</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Entity Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Entity Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entity_type">Entity Type *</Label>
                  <Select 
                    value={formData.entity_type} 
                    onValueChange={(value) => handleInputChange('entity_type', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entity_name">Organization/Institution Name *</Label>
                  <Input
                    id="entity_name"
                    value={formData.entity_name}
                    onChange={(e) => handleInputChange('entity_name', e.target.value)}
                    placeholder="Enter your organization name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://your-website.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geographic_location">Geographic Location</Label>
                  <Input
                    id="geographic_location"
                    value={formData.geographic_location}
                    onChange={(e) => handleInputChange('geographic_location', e.target.value)}
                    placeholder="City, State/Province, Country"
                  />
                </div>
              </div>

              {(formData.entity_type === 'high_school' || formData.entity_type === 'university' || formData.entity_type === 'trade_school') && (
                <div className="space-y-2">
                  <Label htmlFor="student_count">Approximate Student Count</Label>
                  <Input
                    id="student_count"
                    type="number"
                    value={formData.student_count}
                    onChange={(e) => handleInputChange('student_count', e.target.value)}
                    placeholder="Number of students"
                  />
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Primary Contact Name *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Partnership Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Partnership Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="description">Organization Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell us about your organization, mission, and values..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partnership_goals">Partnership Goals *</Label>
                <Textarea
                  id="partnership_goals"
                  value={formData.partnership_goals}
                  onChange={(e) => handleInputChange('partnership_goals', e.target.value)}
                  placeholder="What do you hope to achieve through this partnership? What are your specific goals and objectives?"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Preferred Partnership Types (select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PARTNERSHIP_TYPES.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.preferred_partnership_type.includes(type)}
                        onCheckedChange={(checked) => handlePartnershipTypeChange(type, checked as boolean)}
                      />
                      <Label htmlFor={type} className="text-sm font-normal cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_info">Additional Information</Label>
                <Textarea
                  id="additional_info"
                  value={formData.additional_info}
                  onChange={(e) => handleInputChange('additional_info', e.target.value)}
                  placeholder="Any additional information you'd like to share..."
                  rows={3}
                />
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                size="lg"
                disabled={!isFormValid || isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Submit Partnership Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
