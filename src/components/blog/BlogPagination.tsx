import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BlogPagination({ currentPage, totalPages, onPageChange }: BlogPaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="mt-4">
      <Pagination>
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={`h-8 min-w-8 px-2 ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              <span className="sr-only">Previous</span>
            </PaginationPrevious>
          </PaginationItem>
          
          {getPageNumbers().map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
                isActive={currentPage === page}
                className="h-8 min-w-8 px-2"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={`h-8 min-w-8 px-2 ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
            >
              <span className="sr-only">Next</span>
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}