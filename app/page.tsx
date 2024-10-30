"use client";

import { ArrowDownIcon, ArrowUpIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef, useState, useTransition } from "react";
import { searchFood } from "./actions";
import { SearchResults } from "@/components/search-results";

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [searchResults, setSearchResults] = useState<any>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSearch(formData: FormData) {
    const query = formData.get('query') as string;
    
    startTransition(async () => {
      try {
        const results = await searchFood(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        // Handle error state here
      }
    });

    // Optionally clear the form
    formRef.current?.reset();
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 flex flex-col gap-8">
      {/* Search Section */}
      <div className="w-full max-w-3xl mx-auto">
        <form 
          ref={formRef}
          action={handleSearch}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Input
              name="query"
              type="text"
              placeholder="Search for food..."
              className="w-full"
              required
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <div className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
            ) : (
              <>
                <SearchIcon className="size-4" />
                <span className="hidden sm:inline ml-2">Search</span>
              </>
            )}
          </Button>
        </form>

        {/* Search Results */}
        {searchResults && (
          <div className="mt-4">
            <SearchResults results={searchResults} />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 w-full max-w-3xl mx-auto">
        {/* Protein */}
        <div className="bg-chart-1/10 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 text-emerald-500 text-sm mb-1">
            <ArrowUpIcon className="size-4" />
            <span>+12.5%</span>
          </div>
          <span className="text-3xl font-bold text-chart-1">45g</span>
          <span className="text-sm text-muted-foreground">/ 150g</span>
          <span className="text-sm font-medium mt-2">Protein</span>
        </div>

        {/* Carbs */}
        <div className="bg-chart-2/10 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
            <ArrowDownIcon className="size-4" />
            <span>-5.2%</span>
          </div>
          <span className="text-3xl font-bold text-chart-2">180g</span>
          <span className="text-sm text-muted-foreground">/ 300g</span>
          <span className="text-sm font-medium mt-2">Carbs</span>
        </div>

        {/* Fats */}
        <div className="bg-chart-3/10 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 text-emerald-500 text-sm mb-1">
            <ArrowUpIcon className="size-4" />
            <span>+8.3%</span>
          </div>
          <span className="text-3xl font-bold text-chart-3">28g</span>
          <span className="text-sm text-muted-foreground">/ 65g</span>
          <span className="text-sm font-medium mt-2">Fats</span>
        </div>

        {/* Calories */}
        <div className="bg-chart-4/10 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 text-emerald-500 text-sm mb-1">
            <ArrowUpIcon className="size-4" />
            <span>+15.8%</span>
          </div>
          <span className="text-3xl font-bold text-chart-4">1250</span>
          <span className="text-sm text-muted-foreground">/ 2500</span>
          <span className="text-sm font-medium mt-2">Calories</span>
        </div>

        {/* Water */}
        <div className="bg-chart-5/10 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 text-emerald-500 text-sm mb-1">
            <ArrowUpIcon className="size-4" />
            <span>+20.0%</span>
          </div>
          <span className="text-3xl font-bold text-chart-5">1.2L</span>
          <span className="text-sm text-muted-foreground">/ 2.5L</span>
          <span className="text-sm font-medium mt-2">Water</span>
        </div>

        {/* Weight */}
        <div className="bg-muted rounded-lg p-6 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
            <ArrowDownIcon className="size-4" />
            <span>-2.1%</span>
          </div>
          <span className="text-3xl font-bold">75kg</span>
          <span className="text-sm text-muted-foreground">Target: 70kg</span>
          <span className="text-sm font-medium mt-2">Weight</span>
        </div>
      </div>
    </main>
  );
}
