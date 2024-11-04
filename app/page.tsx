'use client';

import { FoodSearch } from '@/components/food-search';
import { NutritionStats } from '@/components/nutrition-stats';
import { DailyMeals } from '@/components/daily-meals';

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-8 flex flex-col gap-8 w-full max-w-3xl mx-auto">
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
