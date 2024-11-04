'use client';

import { useEffect, useState } from 'react';
import { getDailyMeals } from '@/app/actions/meals';
import { useUserStore } from '@/lib/store/user-store';
import { Meal, MealFood, MealType } from '@prisma/client';
import { Beef, Cookie, Flame, Wheat } from 'lucide-react';
import Image from 'next/image';

type MealWithFoods = Meal & {
  foods: (MealFood & {
    food: {
      id: string;
      name: string;
      brand: string | null;
      image: string | null;
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
    };
  })[];
};

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: '🌅 Breakfast',
  LUNCH: '🌞 Lunch',
  DINNER: '🌙 Dinner',
  SNACK: '🍪 Snack',
};

export function DailyMeals() {
  const [meals, setMeals] = useState<MealWithFoods[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    async function fetchMeals() {
      if (!user?.id) return;

      try {
        const result = await getDailyMeals(user.id);
        if (result.success) {
          setMeals(result.meals);
        }
      } catch (error) {
        console.error('Failed to fetch meals:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeals();
  }, [user?.id]);

  if (isLoading) {
    return <div>Loading meals...</div>;
  }

  if (!meals.length) {
    return <div className="text-center text-muted-foreground py-8">No meals added today</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Today&apos;s Meals</h2>
      <div className="space-y-6">
        {Object.values(MealType).map((type) => {
          const mealOfType = meals.find((meal) => meal.type === type);

          if (!mealOfType?.foods.length) return null;

          return (
            <div key={type} className="space-y-3">
              <h3 className="font-medium text-lg">{MEAL_TYPE_LABELS[type]}</h3>
              <div className="space-y-2">
                {mealOfType.foods.map((mealFood) => (
                  <div
                    key={`${mealFood.foodId}-${mealFood.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="relative size-12 shrink-0 rounded-md border bg-muted">
                      {mealFood.food.image ? (
                        <Image
                          src={mealFood.food.image}
                          alt={mealFood.food.name}
                          fill
                          sizes="48px"
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center">
                          <Cookie className="size-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{mealFood.food.name}</h4>
                        <span className="text-sm text-muted-foreground">{mealFood.amount}g</span>
                      </div>
                      {mealFood.food.brand && (
                        <p className="text-sm text-muted-foreground truncate">
                          {mealFood.food.brand}
                        </p>
                      )}
                      <div className="flex gap-3 mt-1 text-sm">
                        <NutritionInfo
                          icon={<Flame className="size-3.5" />}
                          value={Math.round((mealFood.food.calories * mealFood.amount) / 100)}
                          title="Calories"
                        />
                        <NutritionInfo
                          icon={<Beef className="size-3.5" />}
                          value={((mealFood.food.proteins * mealFood.amount) / 100).toFixed(1)}
                          unit="g"
                          title="Protein"
                        />
                        <NutritionInfo
                          icon={<Wheat className="size-3.5" />}
                          value={((mealFood.food.carbs * mealFood.amount) / 100).toFixed(1)}
                          unit="g"
                          title="Carbs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
