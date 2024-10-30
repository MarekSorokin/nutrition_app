import Image from "next/image";
import { Flame, Beef, Wheat, Cookie, Flag, Search } from "lucide-react";
import { saveFood, searchOnline } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import type { Product, SearchResults as SearchResultsType } from "@/types/food";

interface SearchResultsProps {
  results: SearchResultsType;
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [combinedResults, setCombinedResults] = useState(results);

  if (!results.products.length) {
    return <div className="text-center text-muted-foreground">No products found</div>;
  }

  const handleSaveFood = async (product: Product) => {
    try {
      const result = await saveFood({
        name: product.name,
        brand: product.brand,
        image: product.image,
        calories: product.nutritionPer100g.calories,
        proteins: product.nutritionPer100g.proteins,
        carbs: product.nutritionPer100g.carbs,
        fats: product.nutritionPer100g.fats,
      })

      if (result.success) {
        toast.success('Food saved successfully!')
      } else {
        toast.error(result.error || 'Failed to save food')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save food')
    }
  }

  const handleSearchOnline = async () => {
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
      <SearchHeader 
        fromDb={combinedResults.fromDb}
        total={combinedResults.total}
        showOnlineSearch={results.fromDb && !isSearchingOnline}
        onSearchOnline={handleSearchOnline}
      />
      <ProductList 
        products={combinedResults.products}
        onSave={handleSaveFood}
      />
    </div>
  );
}

// Subcomponents
interface SearchHeaderProps {
  fromDb: boolean;
  total?: number;
  showOnlineSearch: boolean;
  onSearchOnline: () => void;
}

function SearchHeader({ fromDb, total, showOnlineSearch, onSearchOnline }: SearchHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {fromDb ? 'Found in your database' : `Found ${total} products`}
      </p>
      {showOnlineSearch && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={onSearchOnline}
          className="gap-2"
        >
          <Search className="size-4" />
          Search Online
        </Button>
      )}
    </div>
  );
}

interface ProductListProps {
  products: Product[];
  onSave: (product: Product) => void;
}

function ProductList({ products, onSave }: ProductListProps) {
  return (
    <div className="grid gap-3">
      {products.map((product, i) => (
        <ProductCard 
          key={`${product.name}-${i}`}
          product={product}
          onSave={onSave}
        />
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onSave: (product: Product) => void;
}

function ProductCard({ product, onSave }: ProductCardProps) {
  return (
    <div className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <ProductImage src={product.image} alt={product.name} />
      <ProductInfo product={product} />
      {product.canBeSaved && (
        <Button 
          size="sm" 
          onClick={() => onSave(product)}
          className="ml-auto"
        >
          Save
        </Button>
      )}
    </div>
  );
}

function ProductImage({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="relative size-16 shrink-0 rounded-md border bg-muted">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="64px"
          className="object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "";
            target.onerror = null;
            target.parentElement?.classList.add("fallback-image");
          }}
        />
      ) : (
        <div className="size-full flex items-center justify-center">
          <Cookie className="size-8 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

function ProductInfo({ product }: { product: Product }) {
  return (
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
      
      <div className="flex gap-3 mt-1 text-sm">
        <NutritionInfo 
          icon={<Flame className="size-3.5" />}
          value={Math.round(product.nutritionPer100g.calories)}
          title="Calories"
        />
        <NutritionInfo 
          icon={<Beef className="size-3.5" />}
          value={product.nutritionPer100g.proteins.toFixed(1)}
          unit="g"
          title="Protein"
        />
        <NutritionInfo 
          icon={<Wheat className="size-3.5" />}
          value={product.nutritionPer100g.carbs.toFixed(1)}
          unit="g"
          title="Carbs"
        />
      </div>
    </div>
  );
}

interface NutritionInfoProps {
  icon: React.ReactNode;
  value: string | number;
  unit?: string;
  title: string;
}

function NutritionInfo({ icon, value, unit = '', title }: NutritionInfoProps) {
  return (
    <div className="flex items-center gap-1" title={title}>
      {icon}
      <span>{value}{unit}</span>
    </div>
  );
} 