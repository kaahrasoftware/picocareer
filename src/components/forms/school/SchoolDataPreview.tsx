
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import type { School } from "@/types/database/schools";

interface SchoolDataPreviewProps {
  aiData: Partial<School>;
  currentData: School;
  onUpdate: (fieldsToUpdate: Record<string, any>) => void;
  isLoading: boolean;
}

export function SchoolDataPreview({ aiData, currentData, onUpdate, isLoading }: SchoolDataPreviewProps) {
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

  const getFieldChanges = () => {
    const changes: Array<{
      key: string;
      label: string;
      currentValue: any;
      aiValue: any;
      hasChange: boolean;
      type: 'text' | 'number' | 'array' | 'url' | 'json';
    }> = [];

    const fieldLabels: Record<string, string> = {
      name: "School Name",
      type: "School Type",
      country: "Country",
      state: "State/Province",
      location: "Location",
      website: "Website",
      acceptance_rate: "Acceptance Rate",
      student_population: "Student Population",
      student_faculty_ratio: "Student-Faculty Ratio",
      ranking: "Ranking",
      tuition_fees: "Tuition Fees",
      cover_image_url: "Cover Image URL",
      logo_url: "Logo URL",
      undergraduate_application_url: "Undergraduate Application URL",
      graduate_application_url: "Graduate Application URL",
      admissions_page_url: "Admissions Page URL",
      international_students_url: "International Students URL",
      financial_aid_url: "Financial Aid URL",
      virtual_tour_url: "Virtual Tour URL",
      undergrad_programs_link: "Undergraduate Programs Link",
      grad_programs_link: "Graduate Programs Link"
    };

    Object.entries(aiData).forEach(([key, aiValue]) => {
      if (key in currentData && aiValue !== null && aiValue !== undefined) {
        const currentValue = currentData[key as keyof School];
        const hasChange = JSON.stringify(currentValue) !== JSON.stringify(aiValue);
        
        if (hasChange || currentValue === null || currentValue === undefined || currentValue === '') {
          let type: 'text' | 'number' | 'array' | 'url' | 'json' = 'text';
          
          if (Array.isArray(aiValue)) type = 'array';
          else if (typeof aiValue === 'number') type = 'number';
          else if (typeof aiValue === 'string' && (aiValue.startsWith('http') || key.includes('url'))) type = 'url';
          else if (typeof aiValue === 'object' && aiValue !== null) type = 'json';

          changes.push({
            key,
            label: fieldLabels[key] || key,
            currentValue,
            aiValue,
            hasChange,
            type
          });
        }
      }
    });

    return changes;
  };

  const fieldChanges = getFieldChanges();

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    const newSelectedFields = new Set(selectedFields);
    if (checked) {
      newSelectedFields.add(fieldKey);
    } else {
      newSelectedFields.delete(fieldKey);
    }
    setSelectedFields(newSelectedFields);
  };

  const handleSelectAll = () => {
    if (selectedFields.size === fieldChanges.length) {
      setSelectedFields(new Set());
    } else {
      setSelectedFields(new Set(fieldChanges.map(change => change.key)));
    }
  };

  const handleUpdate = () => {
    const fieldsToUpdate: Record<string, any> = {};
    
    selectedFields.forEach(fieldKey => {
      const change = fieldChanges.find(c => c.key === fieldKey);
      if (change) {
        fieldsToUpdate[fieldKey] = change.aiValue;
      }
    });

    onUpdate(fieldsToUpdate);
  };

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground italic">Not set</span>;
    }

    if (type === 'array' && Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {item}
            </Badge>
          ))}
        </div>
      );
    }

    if (type === 'json' && typeof value === 'object') {
      // Handle JSONB fields like tuition_fees
      if (Object.keys(value).length === 0) {
        return <span className="text-muted-foreground italic">Empty object</span>;
      }
      
      return (
        <div className="bg-gray-50 p-2 rounded text-sm font-mono max-w-md">
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      );
    }

    if (type === 'url' && typeof value === 'string') {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          {value.length > 50 ? `${value.substring(0, 50)}...` : value}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }

    if (type === 'number') {
      return value.toLocaleString();
    }

    return value;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-medium">{fieldChanges.length} fields with updates available</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSelectAll}>
            {selectedFields.size === fieldChanges.length ? "Deselect All" : "Select All"}
          </Button>
          <Button 
            onClick={handleUpdate} 
            disabled={selectedFields.size === 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              `Update ${selectedFields.size} Field${selectedFields.size === 1 ? '' : 's'}`
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {fieldChanges.map((change) => (
          <Card key={change.key} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedFields.has(change.key)}
                  onCheckedChange={(checked) => handleFieldToggle(change.key, checked as boolean)}
                />
                <CardTitle className="text-base">{change.label}</CardTitle>
                {change.hasChange && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Changed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Value</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    {formatValue(change.currentValue, change.type)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-green-700">AI-Fetched Value</label>
                  <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md">
                    {formatValue(change.aiValue, change.type)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {fieldChanges.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Updates Needed</h3>
            <p className="text-muted-foreground">
              The AI didn't find any new information that differs from the current school data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
