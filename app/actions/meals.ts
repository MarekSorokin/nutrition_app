'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SaveFoodInput } from '@/types/food';
import { MealType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { startOfDay, endOfDay } from 'date-fns';

interface AddFoodToMealInput extends SaveFoodInput {
  amount: number;
  mealType: MealType;
}

export async function addFoodToMeal(data: AddFoodToMealInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Not authenticated' };
    }

    let food = await prisma.food.findFirst({
      where: {
        name: data.name,
        brand: data.brand || null,
      },
    });

    if (!food) {
      food = await prisma.food.create({
        data: {
          name: data.name,
          brand: data.brand,
          image: data.image,
          calories: data.calories,
          proteins: data.proteins,
          carbs: data.carbs,
          fats: data.fats,
        },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let meal = await prisma.meal.findFirst({
      where: {
        userId: session.user.id,
        type: data.mealType,
        date: today,
        deletedAt: null,
      },
    });

    if (!meal) {
      meal = await prisma.meal.create({
        data: {
          userId: session.user.id,
          type: data.mealType,
          date: today,
          name: data.mealType.toLowerCase(),
        },
      });
    }

    await prisma.mealFood.create({
      data: {
        mealId: meal.id,
        foodId: food.id,
        amount: data.amount,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to add food to meal:', error);
    return { error: 'Failed to add food to meal' };
  }
}

export async function getDailyMeals(userId: string) {
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
      orderBy: {
        type: 'asc',
      },
    });

    return { success: true, meals };
  } catch (error) {
    console.error('Failed to get daily meals:', error);
    return { error: 'Failed to fetch meals' };
  }
}
export async function deleteFoodFromMeal(mealId: string) {
  try {
    console.log('Deleting meal foods', mealId);
    const exists = await prisma.mealFood.findFirst({
      where: {
        id: mealId,
      },
    });

    if (!exists) {
      return { error: 'Meal food not found' };
    }

    await prisma.mealFood.delete({
      where: {
        id: mealId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete food from meal:', error);
    return { error: 'Failed to delete food from meal' };
  }
}
