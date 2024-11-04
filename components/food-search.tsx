"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";
import { searchFood } from "@/app/actions";
import { useState } from "react";
import { SearchResults } from "./search-results";

export function FoodSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    currentQuery, 
    setCurrentQuery, 
    searchResults, 
    setSearchResults, 
    displaySearchResults,
    setDisplaySearchResults 
  } = useAppStore();

  const handleSearch = async () => {
    if (!currentQuery.trim()) return;
    
    try {
      setIsLoading(true);
      const results = await searchFood(currentQuery);
      setSearchResults(results);
      setDisplaySearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCurrentQuery('');
    setSearchResults({ products: [], fromDb: true });
    setDisplaySearchResults(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search foods..."
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pr-20"
          />
          {currentQuery && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleClear}
              className="absolute right-0 top-0 h-full rounded-l-none"
              title="Clear search"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isLoading || !currentQuery.trim()}
          className="gap-2"
        >
          <Search className="size-4" />
          Search
        </Button>
      </div>

      {displaySearchResults && searchResults && (
        <SearchResults results={searchResults} />
      )}
    </div>
  );
} 