
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2, Share, Eye, EyeOff, Download } from "lucide-react";

interface ContentManagementDropdownProps {
  item: any;
  contentType: string;
  onAction: (action: string) => void;
}

export function ContentManagementDropdown({ 
  item, 
  contentType, 
  onAction 
}: ContentManagementDropdownProps) {
  const isHidden = item.status === "Hidden";
  const hasFileUrl = !!item.file_url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          className="cursor-pointer flex items-center"
          onClick={() => onAction('edit')}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer flex items-center"
          onClick={() => onAction('share')}
        >
          <Share className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
        
        {hasFileUrl && (
          <DropdownMenuItem 
            className="cursor-pointer flex items-center"
            onClick={() => onAction('download')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          className="cursor-pointer flex items-center"
          onClick={() => onAction(isHidden ? 'show' : 'hide')}
        >
          {isHidden ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Make public
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-destructive flex items-center"
          onClick={() => onAction('delete')}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
