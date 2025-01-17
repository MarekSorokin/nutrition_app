'use client';

import { FoodSearch } from '@/components/food/food-search';
import { NutritionStats } from '@/components/nutrition/nutrition-stats';
import { DailyMeals } from '@/components/meals/daily-meals';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col gap-8 w-full max-w-3xl mx-auto">
      {/* Search Section */}
      <FoodSearch />

      {/* Stats Grid */}
      <div className="w-full max-w-3xl mx-auto">
        <NutritionStats />
      </div>

      {/* Daily Meals */}
      <div className="w-full max-w-3xl mx-auto">
        <DailyMeals />
      </div>
    </main>
  );
}
