'use client';

import { useState } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: string;
  url: string;
}

export interface GlobalSearchProps {
  onSearch?: (query: string) => void;
  results?: SearchResult[];
  recentSearches?: string[];
  trendingSearches?: string[];
  className?: string;
}

const defaultResults: SearchResult[] = [
  { id: '1', title: 'Dashboard Overview', description: 'View your dashboard', category: 'Pages', url: '/dashboard' },
  { id: '2', title: 'User Management', description: 'Manage users', category: 'Pages', url: '/users' },
];

export function GlobalSearch({
  onSearch,
  results = defaultResults,
  recentSearches = ['users', 'dashboard'],
  trendingSearches = ['analytics', 'reports'],
  className,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const filteredResults = query ? results.filter(r => 
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.description?.toLowerCase().includes(query.toLowerCase())
  ) : [];

  return (
    <div className={cn('relative flex-1 max-w-2xl', className)}>
      <div className={cn(
        'flex items-center gap-3 px-4 py-2.5 bg-neutral-50 rounded-xl border-2 transition-all',
        focused ? 'border-indigo-500 ring-4 ring-indigo-500/20 bg-white' : 'border-transparent hover:bg-neutral-100'
      )}>
        <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch?.(e.target.value);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          className="flex-1 bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
        />
        {query && (
          <button onClick={() => setQuery('')} className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        )}
      </div>

      {focused && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white rounded-xl border border-neutral-200 shadow-2xl z-50 max-h-96 overflow-y-auto">
          {query ? (
            filteredResults.length > 0 ? (
              filteredResults.map(result => (
                <a
                  key={result.id}
                  href={result.url}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-900">{result.title}</p>
                    {result.description && <p className="text-xs text-neutral-500 mt-0.5">{result.description}</p>}
                  </div>
                  <span className="text-xs text-neutral-400">{result.category}</span>
                </a>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-neutral-900 mb-1">No results found</p>
                <p className="text-xs text-neutral-500">Try a different search term</p>
              </div>
            )
          ) : (
            <>
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    Recent
                  </div>
                  {recentSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(search)}
                      className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}
              {trendingSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-500">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Trending
                  </div>
                  {trendingSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(search)}
                      className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
