import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, FileText, Copy, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Template {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  version: number;
  is_active: boolean;
  is_default: boolean;
  estimated_duration_minutes: number;
  question_sets: any[];
  created_at: string;
  api_organizations: {
    name: string;
  };
}

interface Organization {
  id: string;
  name: string;
}

interface QuestionSet {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
}

interface Question {
  id: string;
  title: string;
  description?: string;
  type: 'multiple_choice' | 'rating_scale' | 'text_input' | 'yes_no';
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    max_length?: number;
  };
  required: boolean;
}

export function TemplateBuilder() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    organization_id: "",
    estimated_duration_minutes: 15,
    question_sets: [] as QuestionSet[]
  });

  const [currentQuestionSet, setCurrentQuestionSet] = useState<QuestionSet>({
    id: "",
    name: "",
    description: "",
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "",
    title: "",
    description: "",
    type: "multiple_choice",
    options: [{ label: "", value: "" }],
    validation: {},
    required: true
  });

  useEffect(() => {
    Promise.all([fetchTemplates(), fetchOrganizations()]);
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('api-templates');
      
      if (error) throw error;
      
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('api-organizations');
      
      if (error) throw error;
      
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const addQuestionOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...(currentQuestion.options || []), { label: "", value: "" }]
    });
  };

  const removeQuestionOption = (index: number) => {
    const newOptions = currentQuestion.options?.filter((_, i) => i !== index) || [];
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const updateQuestionOption = (index: number, field: 'label' | 'value', value: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addQuestionToSet = () => {
    if (!currentQuestion.title.trim()) {
      toast({
        title: "Error",
        description: "Question title is required",
        variant: "destructive",
      });
      return;
    }

    const newQuestion = {
      ...currentQuestion,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setCurrentQuestionSet({
      ...currentQuestionSet,
      questions: [...currentQuestionSet.questions, newQuestion]
    });

    // Reset current question
    setCurrentQuestion({
      id: "",
      title: "",
      description: "",
      type: "multiple_choice",
      options: [{ label: "", value: "" }],
      validation: {},
      required: true
    });

    toast({
      title: "Success",
      description: "Question added to set",
    });
  };

  const addQuestionSetToTemplate = () => {
    if (!currentQuestionSet.name.trim() || currentQuestionSet.questions.length === 0) {
      toast({
        title: "Error",
        description: "Question set must have a name and at least one question",
        variant: "destructive",
      });
      return;
    }

    const newQuestionSet = {
      ...currentQuestionSet,
      id: `qs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setFormData({
      ...formData,
      question_sets: [...formData.question_sets, newQuestionSet]
    });

    // Reset current question set
    setCurrentQuestionSet({
      id: "",
      name: "",
      description: "",
      questions: []
    });

    toast({
      title: "Success",
      description: "Question set added to template",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.question_sets.length === 0) {
      toast({
        title: "Error",
        description: "Template must have at least one question set",
        variant: "destructive",
      });
      return;
    }

    try {
      const templateData = {
        ...formData,
        config: {
          randomize_questions: false,
          allow_retries: true,
          show_progress: true
        },
        scoring_logic: {
          type: "weighted",
          weights: {}
        }
      };

      if (editingTemplate) {
        const { error } = await supabase.functions.invoke('api-templates', {
          method: 'PUT',
          body: { ...templateData, id: editingTemplate.id }
        });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Template updated successfully",
        });
      } else {
        const { error } = await supabase.functions.invoke('api-templates', {
          method: 'POST',
          body: templateData
        });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Template created successfully",
        });
      }
      
      setFormData({
        name: "",
        description: "",
        organization_id: "",
        estimated_duration_minutes: 15,
        question_sets: []
      });
      setIsCreateDialogOpen(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assessment Templates ({templates.length})</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTemplate(null);
              setFormData({
                name: "",
                description: "",
                organization_id: "",
                estimated_duration_minutes: 15,
                question_sets: []
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create Assessment Template'}
              </DialogTitle>
              <DialogDescription>
                Build a custom assessment template with question sets
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Template Basic Info */}
              <div className="space-y-4">
                <h4 className="font-medium">Template Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization_id">Organization *</Label>
                    <Select
                      value={formData.organization_id}
                      onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimated_duration_minutes">Estimated Duration (minutes)</Label>
                  <Input
                    id="estimated_duration_minutes"
                    type="number"
                    value={formData.estimated_duration_minutes}
                    onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>

              {/* Question Set Builder */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Question Set Builder</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="set_name">Question Set Name</Label>
                    <Input
                      id="set_name"
                      value={currentQuestionSet.name}
                      onChange={(e) => setCurrentQuestionSet({ ...currentQuestionSet, name: e.target.value })}
                      placeholder="e.g., Personality Assessment"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="set_description">Set Description</Label>
                    <Input
                      id="set_description"
                      value={currentQuestionSet.description}
                      onChange={(e) => setCurrentQuestionSet({ ...currentQuestionSet, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Question Builder */}
                <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-sm">Add Question</h5>
                  
                  <div className="space-y-2">
                    <Label htmlFor="question_title">Question Title *</Label>
                    <Input
                      id="question_title"
                      value={currentQuestion.title}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, title: e.target.value })}
                      placeholder="Enter your question"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="question_type">Question Type</Label>
                      <Select
                        value={currentQuestion.type}
                        onValueChange={(value: any) => setCurrentQuestion({ ...currentQuestion, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="rating_scale">Rating Scale</SelectItem>
                          <SelectItem value="text_input">Text Input</SelectItem>
                          <SelectItem value="yes_no">Yes/No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center space-x-2">
                        <Checkbox
                          checked={currentQuestion.required}
                          onCheckedChange={(checked) => setCurrentQuestion({ ...currentQuestion, required: !!checked })}
                        />
                        <span>Required</span>
                      </Label>
                    </div>
                  </div>

                  {/* Question Options for Multiple Choice */}
                  {currentQuestion.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      <Label>Answer Options</Label>
                      {currentQuestion.options?.map((option, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            value={option.label}
                            onChange={(e) => updateQuestionOption(index, 'label', e.target.value)}
                            placeholder="Option label"
                          />
                          <Input
                            value={option.value}
                            onChange={(e) => updateQuestionOption(index, 'value', e.target.value)}
                            placeholder="Option value"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestionOption(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addQuestionOption}
                      >
                        Add Option
                      </Button>
                    </div>
                  )}

                  {/* Rating Scale Validation */}
                  {currentQuestion.type === 'rating_scale' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min_value">Minimum Value</Label>
                        <Input
                          id="min_value"
                          type="number"
                          value={currentQuestion.validation?.min || 1}
                          onChange={(e) => setCurrentQuestion({
                            ...currentQuestion,
                            validation: { ...currentQuestion.validation, min: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_value">Maximum Value</Label>
                        <Input
                          id="max_value"
                          type="number"
                          value={currentQuestion.validation?.max || 5}
                          onChange={(e) => setCurrentQuestion({
                            ...currentQuestion,
                            validation: { ...currentQuestion.validation, max: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={addQuestionToSet}
                    className="w-full"
                  >
                    Add Question to Set
                  </Button>
                </div>

                {/* Current Question Set Preview */}
                {currentQuestionSet.questions.length > 0 && (
                  <div className="space-y-2">
                    <Label>Questions in Current Set ({currentQuestionSet.questions.length})</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {currentQuestionSet.questions.map((q, index) => (
                        <div key={index} className="p-2 border rounded text-sm">
                          <strong>{q.title}</strong> ({q.type})
                          {q.required && <Badge variant="secondary" className="ml-2">Required</Badge>}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      onClick={addQuestionSetToTemplate}
                      variant="outline"
                      className="w-full"
                    >
                      Add Question Set to Template
                    </Button>
                  </div>
                )}

                {/* Template Question Sets Preview */}
                {formData.question_sets.length > 0 && (
                  <div className="space-y-2">
                    <Label>Template Question Sets ({formData.question_sets.length})</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formData.question_sets.map((set, index) => (
                        <div key={index} className="p-2 border rounded text-sm">
                          <strong>{set.name}</strong> - {set.questions.length} questions
                          {set.description && <p className="text-muted-foreground">{set.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">{template.name}</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={template.is_default ? "default" : "secondary"}>
                  {template.is_default ? "Default" : `v${template.version}`}
                </Badge>
                <Badge variant={template.is_active ? "default" : "secondary"}>
                  {template.is_active ? "Active" : "Inactive"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(template);
                    setFormData({
                      name: template.name,
                      description: template.description || "",
                      organization_id: template.organization_id,
                      estimated_duration_minutes: template.estimated_duration_minutes,
                      question_sets: template.question_sets || []
                    });
                    setIsCreateDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Organization:</span> {template.api_organizations.name}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {template.estimated_duration_minutes} minutes
                </div>
                <div>
                  <span className="font-medium">Question Sets:</span> {template.question_sets?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(template.created_at).toLocaleDateString()}
                </div>
              </div>
              {template.description && (
                <p className="text-sm text-muted-foreground mt-2">{template.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
        
        {templates.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No templates found</p>
              <p className="text-sm text-muted-foreground">Create your first assessment template to get started</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Preview Dialog */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Template Preview: {previewTemplate.name}</DialogTitle>
              <DialogDescription>
                View template structure and questions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Template Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                  <div><strong>Organization:</strong> {previewTemplate.api_organizations.name}</div>
                  <div><strong>Duration:</strong> {previewTemplate.estimated_duration_minutes} minutes</div>
                  <div><strong>Version:</strong> {previewTemplate.version}</div>
                  <div><strong>Status:</strong> {previewTemplate.is_active ? 'Active' : 'Inactive'}</div>
                </div>
                {previewTemplate.description && (
                  <p className="text-sm text-muted-foreground mt-2">{previewTemplate.description}</p>
                )}
              </div>

              <div>
                <h4 className="font-medium">Question Sets ({previewTemplate.question_sets?.length || 0})</h4>
                <div className="space-y-3 mt-2">
                  {previewTemplate.question_sets?.map((set: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h5 className="font-medium text-sm">{set.name}</h5>
                      {set.description && (
                        <p className="text-xs text-muted-foreground">{set.description}</p>
                      )}
                      <div className="mt-2 space-y-2">
                        {set.questions?.map((question: any, qIndex: number) => (
                          <div key={qIndex} className="text-sm border-l-2 border-gray-200 pl-3">
                            <p className="font-medium">{question.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Type: {question.type}
                              {question.required && ' • Required'}
                            </p>
                            {question.options && (
                              <div className="text-xs mt-1">
                                Options: {question.options.map((opt: any) => opt.label).join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setPreviewTemplate(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}