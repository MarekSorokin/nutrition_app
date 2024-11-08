import { create } from 'zustand';
import { useUserStore } from './user-store';
import { DailyNutrition, getDailyNutrition } from '@/app/actions/nutrition';

interface NutritionState {
  nutrition: DailyNutrition;
  recalculateNutrition: () => Promise<void>;
}

export const useNutritionStore = create<NutritionState>((set) => ({
  nutrition: {
    proteins: 0,
    carbs: 0,
    fats: 0,
    calories: 0,
  },
  recalculateNutrition: async () => {
    const userId = useUserStore.getState().user?.id;
    if (userId) {
      const nutrition = await getDailyNutrition(userId);
      set({ nutrition });
    }
  },
}));
