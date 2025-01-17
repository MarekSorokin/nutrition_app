'use client';

import { FoodSearch } from '@/components/food/food-search';
import { NutritionStats } from '@/components/nutrition/nutrition-stats';
import { DailyMeals } from '@/components/meals/daily-meals';

export default function Home() {
  return (
    <main className="py-6 space-y-8">
      {/* Search Section */}
      <FoodSearch />

      {/* Stats Grid */}
      <NutritionStats />

      {/* Daily Meals */}
      <DailyMeals />
    </main>
  );
}
