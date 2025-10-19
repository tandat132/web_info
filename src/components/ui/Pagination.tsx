import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPages?: number;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showPages = 5 
}: PaginationProps) {
  // Calculate which pages to show
  const getVisiblePages = () => {
    const pages = [];
    const halfShow = Math.floor(showPages / 2);
    
    let startPage = Math.max(1, currentPage - halfShow);
    let endPage = Math.min(totalPages, currentPage + halfShow);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < showPages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + showPages - 1);
      } else {
        startPage = Math.max(1, endPage - showPages + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center space-x-2" aria-label="Pagination">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-lg
          ${currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
          }
        `}
      >
        <ChevronLeftIcon className="h-4 w-4 mr-1" />
        Trước
      </button>

      {/* First page */}
      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            1
          </button>
          {visiblePages[0] > 2 && (
            <span className="px-2 py-2 text-gray-400">...</span>
          )}
        </>
      )}

      {/* Visible pages */}
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`
            px-3 py-2 text-sm font-medium rounded-lg
            ${page === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }
          `}
        >
          {page}
        </button>
      ))}

      {/* Last page */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 py-2 text-gray-400">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-lg
          ${currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
          }
        `}
      >
        Sau
        <ChevronRightIcon className="h-4 w-4 ml-1" />
      </button>
    </nav>
  );
}