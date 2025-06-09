
import { useState } from "react";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEssayPrompts, useMenteeEssayResponses } from "@/hooks/useMenteeData";
import type { Profile } from "@/types/database/profiles";
import type { EssayPromptCategory } from "@/types/mentee-profile";

interface MenteeEssaysTabProps {
  profile: Profile;
  isEditing: boolean;
}

const CATEGORY_COLORS: Record<EssayPromptCategory, string> = {
  college_application: "bg-blue-100 text-blue-800",
  scholarship: "bg-green-100 text-green-800",
  personal_statement: "bg-purple-100 text-purple-800",
  supplemental: "bg-orange-100 text-orange-800",
  creative_writing: "bg-pink-100 text-pink-800",
  academic_reflection: "bg-indigo-100 text-indigo-800"
};

export function MenteeEssaysTab({ profile, isEditing }: MenteeEssaysTabProps) {
  const { data: essayResponses = [], isLoading: responsesLoading } = useMenteeEssayResponses(profile.id);
  const { data: prompts = [], isLoading: promptsLoading } = useEssayPrompts();

  if (responsesLoading || promptsLoading) {
    return <div>Loading essays...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Essay Responses</h3>
        {isEditing && (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Write Essay
          </Button>
        )}
      </div>

      {/* Available Prompts (when editing) */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Available Essay Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {prompts.map((prompt) => {
                const hasResponse = essayResponses.some(r => r.prompt_id === prompt.id);
                return (
                  <div key={prompt.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{prompt.title}</h4>
                        <Badge className={CATEGORY_COLORS[prompt.category]}>
                          {prompt.category.replace('_', ' ')}
                        </Badge>
                        {prompt.word_limit && (
                          <Badge variant="outline">{prompt.word_limit} words</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {prompt.prompt_text}
                      </p>
                    </div>
                    <Button size="sm" disabled={hasResponse}>
                      {hasResponse ? 'Completed' : 'Start Writing'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Essay Responses */}
      {essayResponses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            No essay responses yet. {isEditing && "Choose a prompt above to start writing."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {essayResponses.map((response) => (
            <Card key={response.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">{response.prompt?.title}</CardTitle>
                    <Badge className={CATEGORY_COLORS[response.prompt?.category || 'personal_statement']}>
                      {response.prompt?.category.replace('_', ' ')}
                    </Badge>
                    {response.is_draft && (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {response.prompt?.prompt_text}
                  </p>
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Word Count:</span> {response.word_count}
                    </div>
                    {response.prompt?.word_limit && (
                      <div>
                        <span className="font-medium">Limit:</span> {response.prompt.word_limit}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Version:</span> {response.version}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span> {new Date(response.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {response.response_text && (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap line-clamp-6">
                        {response.response_text}
                      </p>
                      {response.response_text.length > 300 && (
                        <Button variant="link" size="sm" className="mt-2 p-0">
                          Read full essay
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
