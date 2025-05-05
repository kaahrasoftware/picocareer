
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BlogPagination({ currentPage, totalPages, onPageChange }: BlogPaginationProps) {
  const getPageNumbers = () => {
    const maxPagesDisplayed = 5;
    const pages: Array<number | string> = [];
    
    // Logic to calculate which page numbers to show
    if (totalPages <= maxPagesDisplayed) {
      // If we have 5 or fewer total pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate the start and end of the current page window
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust window to always show 3 pages
      if (start === 2) end = Math.min(totalPages - 1, start + 2);
      if (end === totalPages - 1) start = Math.max(2, end - 2);
      
      // Add ellipsis before the window if needed
      if (start > 2) pages.push('ellipsis1'); // Use string for ellipsis
      
      // Add the window pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis after the window if needed
      if (end < totalPages - 1) pages.push('ellipsis2'); // Use string for the second ellipsis
      
      // Always include last page if there are more than 1 page
      if (totalPages > 1) pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="mt-4">
      <Pagination>
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={`h-8 min-w-8 px-2 ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {getPageNumbers().map((page, index) => (
            <PaginationItem key={index}>
              {typeof page === 'string' ? (
                <span className="h-8 min-w-8 px-2 flex items-center justify-center">...</span>
              ) : (
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                  isActive={currentPage === page}
                  className="h-8 min-w-8 px-2"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={`h-8 min-w-8 px-2 ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
