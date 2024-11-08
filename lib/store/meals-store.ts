import { create } from 'zustand';
import { deleteFoodFromMeal, getDailyMeals } from '@/app/actions/meals';
import type { Meal, MealFood } from '@prisma/client';
import { toast } from 'sonner';
import { useUserStore } from './user-store';
import { getDailyNutrition } from '@/app/actions/nutrition';

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

interface MealsState {
  meals: MealWithFoods[];
  isLoading: boolean;
  fetchMeals: (userId: string) => Promise<void>;
  removeMeal: (mealId: string) => Promise<void>;
}

export const useMealsStore = create<MealsState>((set, get) => ({
  meals: [],
  isLoading: false,
  fetchMeals: async (userId: string) => {
    try {
      set({ isLoading: true });
      const result = await getDailyMeals(userId);
      if (result.success) {
        set({ meals: result.meals });
      }
    } catch (error) {
      console.error('Failed to fetch meals:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  removeMeal: async (mealId: string) => {
    try {
      set({ isLoading: true });
      const isDeleted = await deleteFoodFromMeal(mealId);

      if (isDeleted.success) {
        const userId = useUserStore.getState().user?.id;

        if (userId) {
          await get().fetchMeals(userId);
        }

        toast.success('Meal deleted successfully');
      } else {
        toast.error(isDeleted.error);
      }
    } catch (error) {
      toast.error('Failed to delete meal' + error);
    } finally {
      set({ isLoading: false });
    }
  },
  recalculateNutrition: async () => {
    const userId = useUserStore.getState().user?.id;
    if (userId) {
      const nutrition = await getDailyNutrition(userId);
      set({ nutrition });
    }
  },
}));
