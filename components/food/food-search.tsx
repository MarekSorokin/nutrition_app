'use client';

import { useCallback, useState } from 'react';
import { Search, X, Globe, Barcode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store/app-store';
import { searchFood, searchOnline } from '@/app/actions';
import { debounce } from '@/lib/utils/debounce';
import { SearchResults } from './search-results';
import { BarcodeScanner } from './barcode-scanner';
import { toast } from 'sonner';

export function FoodSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const {
    currentQuery,
    setCurrentQuery,
    searchResults,
    setSearchResults,
    displaySearchResults,
    setDisplaySearchResults,
  } = useAppStore();

  const performSearch = useCallback(
    async (query: string, searchType: 'local' | 'online' = 'local') => {
      if (!query.trim()) return;

      try {
        setIsLoading(true);
        if (searchType === 'local') {
          const localResults = await searchFood(query);
          setSearchResults(localResults);
          setDisplaySearchResults(true);
        } else {
          const onlineResults = await searchOnline(query);
          if (onlineResults.products.length === 0) {
            toast.info('No results found on Open Food Facts');
            return;
          }
          setSearchResults(onlineResults);
          setDisplaySearchResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Search failed');
      } finally {
        setIsLoading(false);
      }
    },
    [setSearchResults, setDisplaySearchResults],
  );

  const debouncedSearch = useCallback(
    debounce((query: string) => performSearch(query), 500),
    [performSearch],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setCurrentQuery(query);
    if (query.length >= 2) {
      debouncedSearch(query);
    } else if (!query) {
      handleClear();
    }
  };

  const handleClear = useCallback(() => {
    setCurrentQuery('');
    setSearchResults({ products: [], fromDb: true });
    setDisplaySearchResults(false);
  }, [setCurrentQuery, setSearchResults, setDisplaySearchResults]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search foods..."
              value={currentQuery}
              onChange={handleInputChange}
            />
            {currentQuery && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClear}
                className="absolute right-0 top-0 h-full rounded-l-none hover:bg-transparent"
                title="Clear search"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
          <Button
            onClick={() => performSearch(currentQuery)}
            disabled={isLoading || !currentQuery.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <div className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="size-4" />
                Search
              </>
            )}
          </Button>
          <Button
            onClick={() => performSearch(currentQuery, 'online')}
            disabled={isLoading || !currentQuery.trim()}
            variant="outline"
            className="gap-2"
            title="Search on Open Food Facts"
          >
            <Globe className="size-4" />
          </Button>
          <Button
            onClick={() => setShowScanner(true)}
            variant="outline"
            className="gap-2"
            title="Scan Barcode"
          >
            <Barcode className="size-4" />
          </Button>
        </div>

        {displaySearchResults && searchResults && <SearchResults results={searchResults} />}
      </div>

      {showScanner && <BarcodeScanner onClose={() => setShowScanner(false)} />}
    </>
  );
}
