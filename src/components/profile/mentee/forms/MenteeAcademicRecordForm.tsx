
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MenteeAcademicRecord } from '@/types/mentee-profile';

interface MenteeAcademicRecordFormProps {
  record?: MenteeAcademicRecord;
  onSubmit: (data: Omit<MenteeAcademicRecord, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export function MenteeAcademicRecordForm({ record, onSubmit, onCancel }: MenteeAcademicRecordFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      mentee_id: record?.mentee_id || '',
      institution_name: record?.institution_name || '',
      degree_type: record?.degree_type || '',
      major: record?.major || '',
      minor: record?.minor || '',
      gpa: record?.gpa || undefined,
      semester_gpa: record?.semester_gpa || undefined,
      cumulative_gpa: record?.cumulative_gpa || undefined,
      credits_attempted: record?.credits_attempted || undefined,
      credits_earned: record?.credits_earned || undefined,
      class_rank: record?.class_rank || '',
      graduation_date: record?.graduation_date || '',
      honors: record?.honors?.join(', ') || '',
      awards: record?.awards?.join(', ') || '',
      relevant_coursework: record?.relevant_coursework?.join(', ') || '',
      thesis_topic: record?.thesis_topic || '',
      year: record?.year || new Date().getFullYear(),
      semester: record?.semester || 'Fall'
    }
  });

  const handleFormSubmit = (data: any) => {
    const formattedData = {
      ...data,
      class_rank: data.class_rank || undefined,
      gpa: data.gpa ? parseFloat(data.gpa) : undefined,
      semester_gpa: data.semester_gpa ? parseFloat(data.semester_gpa) : undefined,
      cumulative_gpa: data.cumulative_gpa ? parseFloat(data.cumulative_gpa) : undefined,
      credits_attempted: data.credits_attempted ? parseInt(data.credits_attempted) : undefined,
      credits_earned: data.credits_earned ? parseInt(data.credits_earned) : undefined,
      honors: data.honors ? data.honors.split(',').map((h: string) => h.trim()).filter(Boolean) : [],
      awards: data.awards ? data.awards.split(',').map((a: string) => a.trim()).filter(Boolean) : [],
      relevant_coursework: data.relevant_coursework ? data.relevant_coursework.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="institution_name">Institution Name</Label>
        <Input
          id="institution_name"
          {...register('institution_name')}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="degree_type">Degree Type</Label>
          <Input
            id="degree_type"
            {...register('degree_type')}
            placeholder="e.g., Bachelor's, Master's"
            required
          />
        </div>
        <div>
          <Label htmlFor="major">Major</Label>
          <Input
            id="major"
            {...register('major')}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="minor">Minor</Label>
        <Input
          id="minor"
          {...register('minor')}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="gpa">Overall GPA</Label>
          <Input
            id="gpa"
            type="number"
            step="0.01"
            min="0"
            max="4"
            {...register('gpa')}
          />
        </div>
        <div>
          <Label htmlFor="semester_gpa">Semester GPA</Label>
          <Input
            id="semester_gpa"
            type="number"
            step="0.01"
            min="0"
            max="4"
            {...register('semester_gpa')}
          />
        </div>
        <div>
          <Label htmlFor="cumulative_gpa">Cumulative GPA</Label>
          <Input
            id="cumulative_gpa"
            type="number"
            step="0.01"
            min="0"
            max="4"
            {...register('cumulative_gpa')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="credits_attempted">Credits Attempted</Label>
          <Input
            id="credits_attempted"
            type="number"
            min="0"
            {...register('credits_attempted')}
          />
        </div>
        <div>
          <Label htmlFor="credits_earned">Credits Earned</Label>
          <Input
            id="credits_earned"
            type="number"
            min="0"
            {...register('credits_earned')}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="class_rank">Class Rank</Label>
        <Input
          id="class_rank"
          {...register('class_rank')}
          placeholder="e.g., Top 10%, 15/200"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            min="1900"
            max={new Date().getFullYear() + 10}
            {...register('year')}
            required
          />
        </div>
        <div>
          <Label htmlFor="semester">Semester</Label>
          <Select onValueChange={(value) => setValue('semester', value)} defaultValue={watch('semester')}>
            <SelectTrigger>
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fall">Fall</SelectItem>
              <SelectItem value="Spring">Spring</SelectItem>
              <SelectItem value="Summer">Summer</SelectItem>
              <SelectItem value="Winter">Winter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="graduation_date">Graduation Date</Label>
        <Input
          id="graduation_date"
          type="date"
          {...register('graduation_date')}
        />
      </div>

      <div>
        <Label htmlFor="honors">Honors (comma-separated)</Label>
        <Input
          id="honors"
          {...register('honors')}
          placeholder="e.g., Magna Cum Laude, Dean's List"
        />
      </div>

      <div>
        <Label htmlFor="awards">Awards (comma-separated)</Label>
        <Input
          id="awards"
          {...register('awards')}
          placeholder="e.g., Outstanding Student Award, Academic Excellence"
        />
      </div>

      <div>
        <Label htmlFor="relevant_coursework">Relevant Coursework (comma-separated)</Label>
        <Textarea
          id="relevant_coursework"
          {...register('relevant_coursework')}
          placeholder="e.g., Data Structures, Algorithms, Machine Learning"
        />
      </div>

      <div>
        <Label htmlFor="thesis_topic">Thesis Topic</Label>
        <Input
          id="thesis_topic"
          {...register('thesis_topic')}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {record ? 'Update' : 'Add'} Record
        </Button>
      </div>
    </form>
  );
}
