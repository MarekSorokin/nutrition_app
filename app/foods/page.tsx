'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { AddCustomFoodModal } from '@/components/food/add-custom-food-modal';
import { EditFoodModal } from '@/components/food/edit-food-modal';
import { toast } from 'sonner';
import { useUserStore } from '@/lib/store/user-store';
import { deleteFood, getFoods } from '@/app/actions/foods';
import Image from 'next/image';

interface Food {
  id: string;
  name: string;
  brand: string | null;
  image: string | null;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFood, setShowAddFood] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const { user } = useUserStore();

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      setIsLoading(true);
      const result = await getFoods();
      if (result.success) {
        setFoods(result.foods);
      } else {
        toast.error('Failed to load foods');
      }
    } catch (error) {
      toast.error('Error loading foods: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this food?')) return;

    try {
      const result = await deleteFood(id);
      if (result.success) {
        toast.success('Food deleted successfully');
        setFoods(foods.filter((food) => food.id !== id));
      } else {
        toast.error(result.error || 'Failed to delete food');
      }
    } catch (error) {
      toast.error('Error deleting food: ' + (error as Error).message);
    }
  };

  const filteredFoods = foods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.brand && food.brand.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Please log in to view your foods</h1>
        </div>
      </div>
    );
  }

  return (
    <main className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Foods</h1>
        <Button onClick={() => setShowAddFood(true)} className="gap-2">
          <Plus className="size-4" />
          Add Food
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="size-8 border-2 border-current border-r-transparent rounded-full animate-spin" />
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? 'No foods found matching your search' : 'No foods added yet'}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFoods.map((food) => (
            <div key={food.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
              <div className="flex-shrink-0">
                {food.image ? (
                  <Image
                    src={food.image}
                    alt={food.name}
                    width={64}
                    height={64}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{food.name}</h3>
                {food.brand && (
                  <p className="text-sm text-muted-foreground truncate">{food.brand}</p>
                )}
                <div className="mt-1 text-sm text-muted-foreground">
                  {food.calories} kcal / 100g
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  P: {food.proteins}g · C: {food.carbs}g · F: {food.fats}g
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingFood(food)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(food.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddFood && (
        <AddCustomFoodModal
          onClose={() => {
            setShowAddFood(false);
            loadFoods();
          }}
        />
      )}

      {editingFood && (
        <EditFoodModal
          food={editingFood}
          onClose={() => {
            setEditingFood(null);
            loadFoods();
          }}
        />
      )}
    </main>
  );
}
