import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Copy, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemplateManagementProps {
  organization: any;
}

export function TemplateManagement({ organization }: TemplateManagementProps) {
  const [templates, setTemplates] = useState([
    {
      id: '1',
      name: 'Default Assessment',
      description: 'Standard career assessment template',
      questions: 25,
      duration: '15 min',
      status: 'active',
      created: '2024-01-15',
      isDefault: true
    },
    {
      id: '2', 
      name: 'Technical Skills Assessment',
      description: 'For technical roles and programming careers',
      questions: 30,
      duration: '20 min',
      status: 'active',
      created: '2024-01-10',
      isDefault: false
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    estimatedDuration: 15
  });

  const { toast } = useToast();

  const handleCreateTemplate = () => {
    // Implementation for creating new template
    toast({
      title: "Template Created",
      description: `Template "${newTemplate.name}" has been created successfully.`,
    });
    setIsCreateDialogOpen(false);
    setNewTemplate({ name: '', description: '', estimatedDuration: 15 });
  };

  const handleCloneTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    toast({
      title: "Template Cloned",
      description: `Created a copy of "${template?.name}".`,
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Default template cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Template Deleted",
      description: "Template has been permanently deleted.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Template Management</h1>
          <p className="text-muted-foreground">Create and manage assessment templates</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a new assessment template for your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="e.g., Software Developer Assessment"
                />
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Describe what this template assesses..."
                />
              </div>
              <div>
                <Label htmlFor="template-duration">Estimated Duration (minutes)</Label>
                <Select 
                  value={newTemplate.estimatedDuration.toString()}
                  onValueChange={(value) => setNewTemplate({...newTemplate, estimatedDuration: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={!newTemplate.name}>
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Templates</CardTitle>
          <CardDescription>
            Manage your organization's assessment templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{template.name}</span>
                      {template.isDefault && (
                        <Badge variant="outline" className="text-xs">Default</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {template.description}
                  </TableCell>
                  <TableCell>{template.questions}</TableCell>
                  <TableCell>{template.duration}</TableCell>
                  <TableCell>
                    <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                      {template.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{template.created}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCloneTemplate(template.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={template.isDefault}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Template Builder Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Template Builder</CardTitle>
          <CardDescription>
            Visual template builder for creating custom assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
            <h3 className="text-lg font-medium mb-2">Template Builder Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              Drag-and-drop interface for creating custom assessment templates
            </p>
            <Button variant="outline">Request Early Access</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}