'use client';

import { memo, useEffect, useState } from 'react';
import { getDailyNutrition } from '@/app/actions/nutrition';
import { useUserStore } from '@/lib/store/user-store';
import { useMealsStore } from '@/lib/store/meals-store';
import type { DailyNutrition } from '@/app/actions/nutrition';

const DEFAULT_GOALS = {
  calories: 2000,
  proteins: 150,
  carbs: 200,
  fats: 70,
};

function NutritionStatsComponent() {
  const { user } = useUserStore();
  const { meals } = useMealsStore();
  const [stats, setStats] = useState<DailyNutrition>({
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNutrition() {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const nutrition = await getDailyNutrition(user.id);
        setStats(nutrition);
      } catch (error) {
        console.error('Failed to fetch nutrition:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNutrition();
  }, [user?.id, meals]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="size-8 border-2 border-current border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const calculatePercentage = (value: number, goal: number) =>
    Math.min(Math.round((value / goal) * 100), 100);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Daily Nutrition</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(stats).map(([key, value]) => {
          const goal = DEFAULT_GOALS[key as keyof typeof DEFAULT_GOALS];
          const percentage = calculatePercentage(value, goal);

          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium capitalize">
                  {key} ({value}
                  {key === 'calories' ? ' kcal' : 'g'})
                </span>
                <span className="text-muted-foreground">
                  {percentage}% of {goal}
                  {key === 'calories' ? ' kcal' : 'g'}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-in-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const NutritionStats = memo(NutritionStatsComponent);
