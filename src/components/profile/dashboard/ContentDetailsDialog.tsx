import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface ContentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: string;
}

export function ContentDetailsDialog({ open, onOpenChange, contentType }: ContentDetailsDialogProps) {
  const { data: contentDetails, isLoading } = useQuery({
    queryKey: ['content-details', contentType],
    queryFn: async () => {
      let query;
      
      switch (contentType.toLowerCase()) {
        case 'blogs':
          const { data: blogs } = await supabase
            .from('blogs')
            .select('*, author:profiles(full_name)')
            .order('created_at', { ascending: false });
          return { items: blogs, type: 'blogs' };

        case 'videos':
          const { data: videos } = await supabase
            .from('videos')
            .select('*, author:profiles(full_name)')
            .order('created_at', { ascending: false });
          return { items: videos, type: 'videos' };

        case 'careers':
          const { data: careers } = await supabase
            .from('careers')
            .select('*')
            .order('created_at', { ascending: false });
          return { items: careers, type: 'careers' };

        case 'majors':
          const { data: majors } = await supabase
            .from('majors')
            .select('*')
            .order('created_at', { ascending: false });
          return { items: majors, type: 'majors' };

        default:
          return { items: [], type: contentType };
      }
    },
    enabled: open,
  });

  if (isLoading) {
    return null;
  }

  const renderContent = () => {
    if (!contentDetails?.items) return null;

    return contentDetails.items.map((item: any) => (
      <div key={item.id} className="bg-muted p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">{item.title}</h4>
          <Badge variant={item.status === 'Approved' ? 'default' : item.status === 'Rejected' ? 'destructive' : 'outline'}>
            {item.status}
          </Badge>
        </div>
        {item.author && (
          <p className="text-sm text-muted-foreground mb-2">
            By {item.author.full_name}
          </p>
        )}
        {item.created_at && (
          <p className="text-sm text-muted-foreground">
            Created: {new Date(item.created_at).toLocaleDateString()}
          </p>
        )}
        {item.description && (
          <p className="text-sm mt-2 line-clamp-2">{item.description}</p>
        )}
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {contentType} Overview
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}