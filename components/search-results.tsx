import Image from 'next/image';
import { Flame, Beef, Wheat, Cookie, Flag, Search, PlusIcon } from 'lucide-react';
import { searchOnline } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Product, SearchResults as SearchResultsType } from '@/types/food';
import { AddFoodModal } from './add-food-modal';
import { useAppStore } from '@/lib/store/app-store';

interface SearchResultsProps {
  results: SearchResultsType;
}

export function SearchResults({ results }: SearchResultsProps) {
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Product | null>(null);
  const { setDisplaySearchResults, setSearchResults, currentQuery } = useAppStore();
  if (!results.products.length) {
    return <div className="text-center text-muted-foreground">No products found</div>;
  }

  const handleSearchOnline = async () => {
    try {
      setIsSearchingOnline(true);
      const newResults = await searchOnline(currentQuery);
      setSearchResults(newResults);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to fetch online results', { description: errorMessage });
    } finally {
      setIsSearchingOnline(false);
    }
  };

  return (
    <div className="space-y-4">
      <SearchHeader
        fromDb={results.fromDb}
        total={results.total}
        showOnlineSearch={results.fromDb && !isSearchingOnline}
        onSearchOnline={handleSearchOnline}
      />
      <ProductList
        products={results.products}
        onAddToMeal={(product) => setSelectedFood(product)}
      />

      {selectedFood && (
        <AddFoodModal
          food={selectedFood}
          isOpen={true}
          onClose={() => {
            setSelectedFood(null);
            setDisplaySearchResults(false);
          }}
        />
      )}
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
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {fromDb ? 'Found in your database' : `Found ${total} products`}
        </p>
      </div>
      {showOnlineSearch && (
        <Button size="sm" variant="outline" onClick={onSearchOnline} className="gap-2">
          <Search className="size-4" />
          Search Online
        </Button>
      )}
    </div>
  );
}

interface ProductListProps {
  products: Product[];
  onAddToMeal: (product: Product) => void;
}

function ProductList({ products, onAddToMeal }: ProductListProps) {
  return (
    <div className="grid gap-3">
      {products.map((product, i) => (
        <ProductCard key={`${product.name}-${i}`} product={product} onAddToMeal={onAddToMeal} />
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onAddToMeal: (product: Product) => void;
}

function ProductCard({ product, onAddToMeal }: ProductCardProps) {
  return (
    <div className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <ProductImage src={product.image} alt={product.name} />
      <ProductInfo product={product} />
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onAddToMeal(product)}
        className="ml-auto"
        title="Add to meal"
      >
        <PlusIcon className="size-4" />
      </Button>
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
            target.src = '';
            target.onerror = null;
            target.parentElement?.classList.add('fallback-image');
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
      <span>
        {value}
        {unit}
      </span>
    </div>
  );
}
