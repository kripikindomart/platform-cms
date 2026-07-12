import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ currentPage, totalPages, onPageChange, className, showFirstLast = true }, ref) => {
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const showEllipsis = totalPages > 7;

      if (!showEllipsis) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('ellipsis1');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('ellipsis1');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('ellipsis1');
          pages.push(currentPage - 1);
          pages.push(currentPage);
          pages.push(currentPage + 1);
          pages.push('ellipsis2');
          pages.push(totalPages);
        }
      }

      return pages;
    };

    const pages = getPageNumbers();

    return (
      <div ref={ref} className={cn('flex items-center gap-1', className)}>
        {/* Previous */}
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'flex items-center gap-1 px-3 h-10 rounded-lg text-sm font-medium transition-all',
            'hover:bg-neutral-100',
            currentPage === 1
              ? 'text-neutral-400 cursor-not-allowed'
              : 'text-neutral-700'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* First Page (optional) */}
        {showFirstLast && totalPages > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={cn(
                'h-10 min-w-[40px] rounded-lg text-sm font-semibold transition-all',
                currentPage === 1
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-neutral-700 hover:bg-neutral-100'
              )}
            >
              1
            </button>
            {currentPage > 3 && totalPages > 7 && (
              <div className="flex items-center justify-center h-10 w-10">
                <MoreHorizontal className="h-4 w-4 text-neutral-400" />
              </div>
            )}
          </>
        )}

        {/* Page Numbers */}
        {!showFirstLast &&
          pages.map((page, index) => {
            if (typeof page === 'string') {
              return (
                <div
                  key={page}
                  className="flex items-center justify-center h-10 w-10"
                >
                  <MoreHorizontal className="h-4 w-4 text-neutral-400" />
                </div>
              );
            }

            return (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={cn(
                  'h-10 min-w-[40px] rounded-lg text-sm font-semibold transition-all',
                  page === currentPage
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-neutral-700 hover:bg-neutral-100'
                )}
              >
                {page}
              </button>
            );
          })}

        {/* Middle Pages for showFirstLast */}
        {showFirstLast &&
          currentPage > 1 &&
          currentPage < totalPages &&
          totalPages > 2 && (
            <>
              {currentPage > 2 && currentPage < 4 && (
                <button
                  onClick={() => onPageChange(2)}
                  className={cn(
                    'h-10 min-w-[40px] rounded-lg text-sm font-semibold transition-all',
                    currentPage === 2
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  )}
                >
                  2
                </button>
              )}
              {currentPage >= 3 && currentPage <= totalPages - 2 && (
                <button
                  onClick={() => onPageChange(currentPage)}
                  className="h-10 min-w-[40px] rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                >
                  {currentPage}
                </button>
              )}
              {currentPage > totalPages - 3 && currentPage < totalPages - 1 && (
                <button
                  onClick={() => onPageChange(totalPages - 1)}
                  className={cn(
                    'h-10 min-w-[40px] rounded-lg text-sm font-semibold transition-all',
                    currentPage === totalPages - 1
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  )}
                >
                  {totalPages - 1}
                </button>
              )}
              {currentPage < totalPages - 2 && totalPages > 7 && (
                <div className="flex items-center justify-center h-10 w-10">
                  <MoreHorizontal className="h-4 w-4 text-neutral-400" />
                </div>
              )}
            </>
          )}

        {/* Last Page (optional) */}
        {showFirstLast && totalPages > 1 && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={cn(
              'h-10 min-w-[40px] rounded-lg text-sm font-semibold transition-all',
              currentPage === totalPages
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-neutral-700 hover:bg-neutral-100'
            )}
          >
            {totalPages}
          </button>
        )}

        {/* Next */}
        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'flex items-center gap-1 px-3 h-10 rounded-lg text-sm font-medium transition-all',
            'hover:bg-neutral-100',
            currentPage === totalPages
              ? 'text-neutral-400 cursor-not-allowed'
              : 'text-neutral-700'
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }
);
Pagination.displayName = 'Pagination';

export { Pagination };
