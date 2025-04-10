
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";

interface StandardPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
}

export function StandardPagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showPageNumbers = true,
  maxPageButtons = 5
}: StandardPaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    if (totalPages <= maxPageButtons) {
      // If we have fewer pages than max buttons, show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always include first, last, current page, and some pages around current
    const halfButtons = Math.floor((maxPageButtons - 3) / 2); // -3 for first, last, and current
    let startPage = Math.max(2, currentPage - halfButtons);
    let endPage = Math.min(totalPages - 1, currentPage + halfButtons);

    // Adjust if we're near the start or end
    if (currentPage - 1 <= halfButtons) {
      endPage = Math.min(totalPages - 1, maxPageButtons - 1);
    } else if (totalPages - currentPage <= halfButtons) {
      startPage = Math.max(2, totalPages - maxPageButtons + 2);
    }

    const pages = [1];
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push(-1); // -1 indicates ellipsis
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push(-2); // -2 indicates ellipsis (using a different key)
    }
    
    // Add last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            aria-disabled={currentPage === 1}
          />
        </PaginationItem>

        {showPageNumbers && getPageNumbers().map((pageNum, index) => {
          // Render ellipsis
          if (pageNum < 0) {
            return (
              <PaginationItem key={`ellipsis-${pageNum}-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          
          // Render page number
          return (
            <PaginationItem key={`page-${pageNum}`}>
              <PaginationLink
                onClick={() => onPageChange(pageNum)}
                isActive={pageNum === currentPage}
                className="cursor-pointer"
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext 
            onClick={() => onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            aria-disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
