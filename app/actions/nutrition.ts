'use server';

import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export interface DailyNutrition {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

export async function getDailyNutrition(userId: string): Promise<DailyNutrition> {
  try {
    const today = new Date();

    const meals = await prisma.meal.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
        deletedAt: null,
      },
      include: {
        foods: {
          include: {
            food: true,
          },
        },
      },
    });

    const totals = meals.reduce(
      (acc, meal) => {
        meal.foods.forEach((mealFood) => {
          const multiplier = mealFood.amount / 100;
          acc.calories += mealFood.food.calories * multiplier;
          acc.proteins += mealFood.food.proteins * multiplier;
          acc.carbs += mealFood.food.carbs * multiplier;
          acc.fats += mealFood.food.fats * multiplier;
        });
        return acc;
      },
      {
        calories: 0,
        proteins: 0,
        carbs: 0,
        fats: 0,
      },
    );

    return {
      calories: Math.round(totals.calories),
      proteins: Math.round(totals.proteins),
      carbs: Math.round(totals.carbs),
      fats: Math.round(totals.fats),
    };
  } catch (error) {
    console.error('Failed to get daily nutrition:', error);
    return {
      calories: 0,
      proteins: 0,
      carbs: 0,
      fats: 0,
    };
  }
}
