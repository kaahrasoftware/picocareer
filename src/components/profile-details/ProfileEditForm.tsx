import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/types/database/profiles";

interface ProfileEditFormProps {
  formData: {
    bio: string;
    position: string;
    company_name: string;
    years_of_experience: number;
    skills: string;
    tools_used: string;
    keywords: string;
    linkedin_url: string;
    github_url: string;
    website_url: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setIsEditing: (value: boolean) => void;
  isMentee: boolean;
}

export function ProfileEditForm({ 
  formData, 
  handleInputChange, 
  handleSubmit, 
  setIsEditing,
  isMentee 
}: ProfileEditFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Bio</label>
          <Textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="Tell us about yourself..."
          />
        </div>

        {!isMentee && (
          <>
            <div>
              <label className="text-sm font-medium">Position</label>
              <Input
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Current position"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Years of Experience</label>
              <Input
                name="years_of_experience"
                type="number"
                value={formData.years_of_experience}
                onChange={handleInputChange}
                className="mt-1"
                min="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Skills (comma-separated)</label>
              <Input
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="React, TypeScript, Node.js"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tools (comma-separated)</label>
              <Input
                name="tools_used"
                value={formData.tools_used}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="VS Code, Git, Docker"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Keywords (comma-separated)</label>
              <Input
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="web development, backend, frontend"
              />
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium">LinkedIn URL</label>
          <Input
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleInputChange}
            className="mt-1"
            type="url"
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div>
          <label className="text-sm font-medium">GitHub URL</label>
          <Input
            name="github_url"
            value={formData.github_url}
            onChange={handleInputChange}
            className="mt-1"
            type="url"
            placeholder="https://github.com/username"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Website URL</label>
          <Input
            name="website_url"
            value={formData.website_url}
            onChange={handleInputChange}
            className="mt-1"
            type="url"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" variant="default">Save Changes</Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}