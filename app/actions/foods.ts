'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const foodSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  image: z.string().url().optional(),
  calories: z.number().min(0),
  proteins: z.number().min(0),
  carbs: z.number().min(0),
  fats: z.number().min(0),
  barcode: z.string().optional(),
});

const updateFoodSchema = foodSchema.extend({
  id: z.string(),
});

// Get all foods
export async function getFoods() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Not authenticated' };
    }

    const foods = await prisma.food.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return { success: true, foods };
  } catch (error) {
    console.error('Failed to get foods:', error);
    return { error: 'Failed to get foods' };
  }
}

// Get food by barcode
export async function getFoodByBarcode(barcode: string) {
  try {
    const food = await prisma.food.findUnique({
      where: {
        barcode,
      },
    });

    if (!food) {
      return { error: 'Food not found' };
    }

    return { success: true, food };
  } catch (error) {
    console.error('Failed to get food by barcode:', error);
    return { error: 'Failed to get food' };
  }
}

// Update food
export async function updateFood(data: z.infer<typeof updateFoodSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Not authenticated' };
    }

    const validatedData = updateFoodSchema.parse(data);

    // If barcode is provided, check if it's already used by another food
    if (validatedData.barcode) {
      const existingFood = await prisma.food.findFirst({
        where: {
          barcode: validatedData.barcode,
          NOT: {
            id: validatedData.id,
          },
        },
      });

      if (existingFood) {
        return { error: 'Barcode is already used by another food' };
      }
    }

    const food = await prisma.food.update({
      where: {
        id: validatedData.id,
      },
      data: {
        name: validatedData.name,
        brand: validatedData.brand || null,
        image: validatedData.image || null,
        calories: validatedData.calories,
        proteins: validatedData.proteins,
        carbs: validatedData.carbs,
        fats: validatedData.fats,
        barcode: validatedData.barcode || null,
      },
    });

    return { success: true, food };
  } catch (error) {
    console.error('Failed to update food:', error);
    if (error instanceof z.ZodError) {
      return { error: 'Invalid food data' };
    }
    return { error: 'Failed to update food' };
  }
}

// Delete food
export async function deleteFood(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Not authenticated' };
    }

    // Check if food is used in any meals
    const usedInMeals = await prisma.mealFood.findFirst({
      where: {
        foodId: id,
      },
    });

    if (usedInMeals) {
      return { error: 'Cannot delete food that is used in meals' };
    }

    await prisma.food.delete({
      where: {
        id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete food:', error);
    return { error: 'Failed to delete food' };
  }
}
