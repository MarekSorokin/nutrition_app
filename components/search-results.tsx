import Image from "next/image";
import { Flame, Beef, Wheat, Cookie, Flag, Search } from "lucide-react";
import { saveFood, searchFood, searchOnline } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface SearchResultsProps {
  results: {
    fromDb: boolean;
    total?: number;
    products: Array<{
      name: string;
      image?: string;
      nutritionPer100g: {
        calories: number;
        proteins: number;
        carbs: number;
        fats: number;
        fiber?: number;
      };
      brand?: string;
      isCzech?: boolean;
      canBeSaved?: boolean;
    }>;
  };
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [combinedResults, setCombinedResults] = useState(results);

  if (!results.products.length) {
    return <div className="text-center text-muted-foreground">No products found</div>;
  }

  async function handleSaveFood(product: any) {
    try {
      const result = await saveFood({
        name: product.name,
        brand: product.brand || undefined,
        image: product.image || undefined,
        calories: Number(product.nutritionPer100g.calories),
        proteins: Number(product.nutritionPer100g.proteins),
        carbs: Number(product.nutritionPer100g.carbs),
        fats: Number(product.nutritionPer100g.fats),
      })

      if (result.success) {
        toast.success('Food saved successfully!')
      } else {
        toast.error('Failed to save food')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save food')
    }
  }

  async function handleSearchOnline() {
    try {
      setIsSearchingOnline(true);
      const newResults = await searchOnline(query, results);
      setCombinedResults(newResults);
    } catch (error) {
      toast.error('Failed to fetch online results');
    } finally {
      setIsSearchingOnline(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {combinedResults.fromDb ? 'Found in your database' : `Found ${combinedResults.total} products`}
        </p>
        {results.fromDb && !isSearchingOnline && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleSearchOnline}
            className="gap-2"
          >
            <Search className="size-4" />
            Search Online
          </Button>
        )}
      </div>

      <div className="grid gap-3">
        {combinedResults.products.map((product, i) => (
          <div
            key={i}
            className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            {/* Image */}
            <div className="relative size-16 shrink-0 rounded-md border bg-muted">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 64px, 64px"
                  className="object-cover rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = ""; // Clear the broken image
                    target.onerror = null; // Prevent infinite loop
                    target.parentElement?.classList.add("fallback-image");
                  }}
                />
              ) : (
                <div className="size-full flex items-center justify-center">
                  <Cookie className="size-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{product.name}</h3>
                {product.isCzech && (
                  <span title="Czech Product">
                    <Flag className="size-4 text-blue-500" aria-label="Czech Product" />
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{product.brand}</p>
              
              {/* Nutrition icons */}
              <div className="flex gap-3 mt-1 text-sm">
                <div className="flex items-center gap-1" title="Calories">
                  <Flame className="size-3.5" />
                  <span>{Math.round(product.nutritionPer100g.calories)}</span>
                </div>
                <div className="flex items-center gap-1" title="Protein">
                  <Beef className="size-3.5" />
                  <span>{product.nutritionPer100g.proteins.toFixed(1)}g</span>
                </div>
                <div className="flex items-center gap-1" title="Carbs">
                  <Wheat className="size-3.5" />
                  <span>{product.nutritionPer100g.carbs.toFixed(1)}g</span>
                </div>
              </div>
            </div>

            {/* Add save button if product can be saved */}
            {product.canBeSaved && (
              <Button 
                size="sm" 
                onClick={() => handleSaveFood(product)}
                className="ml-auto"
              >
                Save
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 