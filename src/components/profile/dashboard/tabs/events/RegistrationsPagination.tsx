
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface RegistrationsPaginationProps {
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  totalCount: number;
  displayCount: number;
}

export function RegistrationsPagination({ 
  currentPage, 
  totalPages, 
  setPage,
  totalCount,
  displayCount
}: RegistrationsPaginationProps) {
  if (totalPages <= 1) return (
    <div className="text-sm text-muted-foreground text-center mt-4">
      Showing {displayCount} of {totalCount} registrations
    </div>
  );

  return (
    <>
      <div className="mt-4 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1} 
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show at most 5 page numbers
              let pageNum = currentPage;
              if (currentPage <= 3) {
                // At the start, show 1, 2, 3, 4, 5
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                // At the end, show last 5 pages
                pageNum = totalPages - 4 + i;
              } else {
                // In the middle, show current page and 2 before/after
                pageNum = currentPage + (i - 2);
              }
              
              // Only show valid page numbers
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      onClick={() => setPage(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              return null;
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages} 
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div className="text-sm text-muted-foreground text-center mt-4">
        Showing {displayCount} of {totalCount} registrations
      </div>
    </>
  );
}
