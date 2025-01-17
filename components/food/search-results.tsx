'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { SearchResults as SearchResultsType } from '@/types/food';
import { useState } from 'react';
import { AddFoodModal } from './add-food-modal';

interface SearchResultsProps {
  results: SearchResultsType;
}

function SearchResultsComponent({ results }: SearchResultsProps) {
  const [selectedFood, setSelectedFood] = useState<{
    name: string;
    brand?: string;
    image?: string;
    nutritionPer100g: {
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
    };
  } | null>(null);

  if (!results.products.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No results found. Try a different search term.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {results.products.map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="flex items-center gap-4 p-4 rounded-lg border bg-card"
          >
            <div className="flex-shrink-0">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="rounded-md object-cover"
                  style={{ height: 'auto' }}
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{product.name}</h3>
              {product.brand && (
                <p className="text-sm text-muted-foreground truncate">{product.brand}</p>
              )}
              <div className="mt-1 text-sm text-muted-foreground">
                {product.nutritionPer100g.calories} kcal / 100g
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="flex-shrink-0"
              onClick={() => setSelectedFood(product)}
            >
              <Plus className="size-4 mr-2" />
              Add
            </Button>
          </div>
        ))}
      </div>

      <AddFoodModal
        food={selectedFood}
        onClose={() => setSelectedFood(null)}
        open={!!selectedFood}
      />
    </>
  );
}

export const SearchResults = memo(SearchResultsComponent);
