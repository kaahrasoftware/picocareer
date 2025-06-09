
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUserContent, useBookmarkContent } from "@/hooks/useUserContent";
import { format } from "date-fns";

// Define a safe type for BlogWithAuthor that avoids infinite type expansion
interface BlogWithAuthor {
  id: string;
  title: string;
  summary: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  categories: string[];
  subcategories: string[];
  cover_image_url: string | null;
  status: string;
  is_recent: boolean;
  profiles: any; // This can be more strictly typed if needed
  [key: string]: any; // Allow other properties to exist
}

interface ProfileContentTabProps {
  profileId: string;
  contentType: string;
}

export function ProfileContentTab({ profileId, contentType }: ProfileContentTabProps) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: userContent, isLoading } = useUserContent(profileId, contentType);
  const { addBookmark, removeBookmark, checkIsBookmarked } = useBookmarkContent(profileId);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const handleBookmarkToggle = async (item: any) => {
    const isBookmarked = await checkIsBookmarked(contentType, item.id);
    
    if (isBookmarked) {
      await removeBookmark(contentType, item.id);
    } else {
      await addBookmark(contentType, item.id);
    }
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const renderItemCard = (item: any) => {
    switch (contentType) {
      case 'blogs': 
        return (
          <Card key={item.id} className="overflow-hidden">
            <div className="h-40 bg-muted overflow-hidden">
              {item.cover_image_url && (
                <img 
                  src={item.cover_image_url} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.categories?.slice(0, 3).map((category: string, idx: number) => (
                  <Badge key={idx} variant="secondary">{category}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.created_at)}
                </span>
                <Button size="sm" onClick={() => handleViewDetails(item)}>
                  Read More
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'hub_resources':
        return (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge variant="outline">{item.resource_type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-muted-foreground">
                  {formatDate(item.created_at)}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Open
                  </Button>
                  <Button size="sm" onClick={() => handleViewDetails(item)}>
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title || item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{item.description}</p>
              <Button size="sm" className="mt-2" onClick={() => handleViewDetails(item)}>
                View Details
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  if (isLoading) {
    return <div>Loading {contentType}...</div>;
  }

  if (!userContent || userContent.length === 0) {
    return (
      <Card className="text-center p-8">
        <p className="text-muted-foreground">No {contentType.replace('_', ' ')} found for this profile.</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userContent.map((item: any) => renderItemCard(item))}
      </div>

      {selectedItem && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedItem.title || selectedItem.name}</DialogTitle>
            </DialogHeader>
            
            {contentType === 'blogs' && (
              <div className="space-y-4">
                {selectedItem.cover_image_url && (
                  <img 
                    src={selectedItem.cover_image_url} 
                    alt={selectedItem.title} 
                    className="w-full max-h-60 object-cover rounded-md"
                  />
                )}
                <div className="flex flex-wrap gap-2">
                  {selectedItem.categories?.map((category: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{category}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Published: {formatDate(selectedItem.created_at)}
                </p>
                <div className="prose max-w-none">
                  <p>{selectedItem.summary}</p>
                  <div dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
                </div>
              </div>
            )}
            
            {contentType === 'hub_resources' && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Badge variant="outline">{selectedItem.resource_type}</Badge>
                  <Badge variant="outline">{selectedItem.access_level}</Badge>
                </div>
                <p>{selectedItem.description}</p>
                <div className="flex justify-end gap-2">
                  {selectedItem.file_url && (
                    <Button>
                      Download
                    </Button>
                  )}
                  {selectedItem.external_url && (
                    <Button variant="outline" asChild>
                      <a href={selectedItem.external_url} target="_blank" rel="noopener noreferrer">
                        Visit External Link
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
