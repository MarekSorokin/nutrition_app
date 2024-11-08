'use client';

import { useEffect, useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';
import { useNutritionStore } from '@/lib/store/nutrition-store';
import { useMealsStore } from '@/lib/store/meals-store';

const DAILY_GOALS = {
  calories: 2500,
  proteins: 150,
  carbs: 300,
  fats: 65,
};

export function NutritionStats() {
  const [isLoading, setIsLoading] = useState(true);
  const user = useUserStore((state) => state.user);
  const { nutrition } = useNutritionStore();
  const { meals } = useMealsStore();

  useEffect(() => {
    if (!user?.id) return;

    setIsLoading(true);
    useNutritionStore.getState().recalculateNutrition();
    setIsLoading(false);
  }, [user?.id, meals]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const stats = [
    {
      name: 'Protein',
      value: nutrition.proteins,
      goal: DAILY_GOALS.proteins,
      bgColor: 'bg-chart-1/10',
      textColor: 'text-chart-1',
    },
    {
      name: 'Carbs',
      value: nutrition.carbs,
      goal: DAILY_GOALS.carbs,
      bgColor: 'bg-chart-2/10',
      textColor: 'text-chart-2',
    },
    {
      name: 'Fats',
      value: nutrition.fats,
      goal: DAILY_GOALS.fats,
      bgColor: 'bg-chart-3/10',
      textColor: 'text-chart-3',
    },
    {
      name: 'Calories',
      value: nutrition.calories,
      goal: DAILY_GOALS.calories,
      bgColor: 'bg-chart-4/10',
      textColor: 'text-chart-4',
      unit: '',
    },
  ];

  return (
    <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4 w-full">
      {stats.map((stat) => {
        const percentage = (stat.value / stat.goal) * 100;
        const isUp = percentage > 0;

        return (
          <div
            key={stat.name}
            className={`${stat.bgColor} rounded-lg p-6 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform`}
          >
            <div className="flex items-center gap-2 text-sm mb-1">
              {isUp ? (
                <ArrowUpIcon className="size-4 text-emerald-500" />
              ) : (
                <ArrowDownIcon className="size-4 text-red-500" />
              )}
              <span className={isUp ? 'text-emerald-500' : 'text-red-500'}>
                {percentage.toFixed(1)}%
              </span>
            </div>
            <span className={`text-3xl font-bold ${stat.textColor}`}>
              {stat.value}
              {stat.unit ?? 'g'}
            </span>
            <span className="text-sm text-muted-foreground">
              / {stat.goal}
              {stat.unit ?? 'g'}
            </span>
            <span className="text-sm font-medium mt-2">{stat.name}</span>
          </div>
        );
      })}
    </div>
  );
}
