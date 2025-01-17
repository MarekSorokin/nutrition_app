'use client';

import { memo, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMealsStore } from '@/lib/store/meals-store';
import { useUserStore } from '@/lib/store/user-store';
import Image from 'next/image';

function DailyMealsComponent() {
  const { user } = useUserStore();
  const { meals, isLoading, fetchMeals, removeMeal } = useMealsStore();

  useEffect(() => {
    if (user?.id) {
      fetchMeals(user.id);
    }
  }, [user?.id, fetchMeals]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="size-8 border-2 border-current border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!meals.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No meals added yet. Start by searching for food and adding it to your meals.
      </div>
    );
  }

  const formatMealType = (type: string) =>
    type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

  return (
    <div className="space-y-6">
      {meals.map((meal) => (
        <div key={meal.id} className="space-y-4">
          <h2 className="text-lg font-semibold">{formatMealType(meal.type)}</h2>
          <div className="space-y-2">
            {meal.foods.map((mealFood) => {
              const food = mealFood.food;
              const multiplier = mealFood.amount / 100;

              return (
                <div
                  key={mealFood.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="flex-shrink-0">
                    {food.image ? (
                      <Image
                        src={food.image}
                        alt={food.name}
                        width={48}
                        height={48}
                        className="rounded-md object-cover"
                        style={{ height: 'auto' }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">
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
                      {mealFood.amount}g · {Math.round(food.calories * multiplier)} kcal
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeMeal(mealFood.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export const DailyMeals = memo(DailyMealsComponent);
