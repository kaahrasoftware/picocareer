
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, ExternalLink, Bookmark } from "lucide-react";

interface Scholarship {
  id: string;
  title?: string;
  description?: string;
  provider_name?: string;
  amount?: string;
  deadline?: string;
  status?: string;
  application_url?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  eligibility_criteria?: string;
  academic_requirements?: string;
  application_process?: string;
  bookmarkId?: string;
}

interface ScholarshipBookmarksProps {
  scholarships: any[];
}

export function ScholarshipBookmarks({ scholarships }: ScholarshipBookmarksProps) {
  if (scholarships.length === 0) {
    return (
      <div className="text-center py-12">
        <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No bookmarked scholarships</h3>
        <p className="text-muted-foreground">
          Start exploring scholarships to bookmark your favorites
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {scholarships.map((bookmark) => (
        <Card key={bookmark.id} className="h-full">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg line-clamp-2">
                {bookmark.title || 'Scholarship'}
              </CardTitle>
              {bookmark.featured && (
                <Badge variant="secondary" className="shrink-0">
                  Featured
                </Badge>
              )}
            </div>
            {bookmark.provider_name && (
              <CardDescription>{bookmark.provider_name}</CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {bookmark.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {bookmark.description}
              </p>
            )}
            
            <div className="space-y-2">
              {bookmark.amount && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{bookmark.amount}</span>
                </div>
              )}
              
              {bookmark.deadline && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span>Due: {new Date(bookmark.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {bookmark.tags.slice(0, 3).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {bookmark.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{bookmark.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {bookmark.application_url && (
                <Button size="sm" className="flex-1" asChild>
                  <a 
                    href={bookmark.application_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Apply
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
