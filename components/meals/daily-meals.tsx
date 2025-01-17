'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { AddFoodModal } from '@/components/food/add-food-modal';
import type { MealType } from '@prisma/client';
import { toast } from 'sonner';
import { deleteFoodFromMeal } from '@/app/actions/meals';
import { useUserStore } from '@/lib/store/user-store';
import { useMealsStore } from '@/lib/store/meals-store';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface MealFood {
  id: string;
  amount: number;
  food: {
    name: string;
    brand: string | null;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
}

interface Meal {
  id: string;
  name: string;
  type: MealType;
  date: Date | string;
  foods: MealFood[];
}

interface MealItemProps {
  meal: Meal;
  onDelete: (id: string) => void;
  onAddFood: (type: MealType) => void;
}

function MealItem({ meal, onDelete }: MealItemProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0], [1, 0]);
  const background = useTransform(x, [-100, 0], ['rgb(239 68 68)', 'rgb(239 68 68 / 0)']);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    if (info.offset.x < -100) {
      x.set(-100);
      setTimeout(() => {
        onDelete(meal.foods[0].id);
      }, 200);
    } else {
      x.set(0);
    }
    setIsDragging(false);
  };

  const handleDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } },
  ) => {
    const newX = Math.min(0, info.offset.x);
    x.set(newX);
    setIsDragging(newX < -100);
  };

  const totalCalories = meal.foods.reduce(
    (sum, item) => sum + (item.food.calories * item.amount) / 100,
    0,
  );
  const totalProteins = meal.foods.reduce(
    (sum, item) => sum + (item.food.proteins * item.amount) / 100,
    0,
  );
  const totalCarbs = meal.foods.reduce(
    (sum, item) => sum + (item.food.carbs * item.amount) / 100,
    0,
  );
  const totalFats = meal.foods.reduce((sum, item) => sum + (item.food.fats * item.amount) / 100, 0);

  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 flex items-center justify-end px-4 rounded-lg"
        style={{ background, opacity }}
      >
        <Trash2
          className={`size-5 transition-colors ${isDragging ? 'text-white' : 'text-white/70'}`}
        />
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative bg-card border rounded-lg p-4 touch-pan-y cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{meal.name}</h3>
        </div>
        {meal.foods.length === 0 ? (
          <p className="text-sm text-muted-foreground">No foods added yet</p>
        ) : (
          <>
            <div className="space-y-2">
              {meal.foods.map((item) => (
                <div key={item.id} className="text-sm">
                  <div className="flex justify-between">
                    <span>
                      {item.food.name}
                      {item.food.brand && (
                        <span className="text-muted-foreground"> • {item.food.brand}</span>
                      )}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round((item.food.calories * item.amount) / 100)} kcal
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.amount}g • P: {((item.food.proteins * item.amount) / 100).toFixed(1)}g •
                    C: {((item.food.carbs * item.amount) / 100).toFixed(1)}g • F:{' '}
                    {((item.food.fats * item.amount) / 100).toFixed(1)}g
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t text-sm">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{Math.round(totalCalories)} kcal</span>
              </div>
              <div className="text-xs text-muted-foreground">
                P: {totalProteins.toFixed(1)}g • C: {totalCarbs.toFixed(1)}g • F:{' '}
                {totalFats.toFixed(1)}g
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export function DailyMeals() {
  const [addingFoodToMealType, setAddingFoodToMealType] = useState<MealType | null>(null);
  const { user } = useUserStore();
  const { meals, isLoading, fetchMeals } = useMealsStore();

  useEffect(() => {
    if (user?.id) {
      fetchMeals(user.id);
    }
  }, [fetchMeals, user?.id]);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteFoodFromMeal(id);
      if (result.success) {
        toast.success('Meal deleted successfully');
        if (user?.id) {
          fetchMeals(user.id);
        }
      } else {
        toast.error(result.error || 'Failed to delete meal');
      }
    } catch (error) {
      toast.error('Error deleting meal: ' + (error as Error).message);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to view your meals</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="size-8 border-2 border-current border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {format(new Date(), 'EEEE d. MMMM yyyy', { locale: cs })}
      </h2>

      <div className="space-y-4">
        {meals.map((meal) => (
          <MealItem
            key={meal.id}
            meal={meal}
            onDelete={handleDelete}
            onAddFood={(type) => setAddingFoodToMealType(type)}
          />
        ))}
      </div>

      {addingFoodToMealType && (
        <AddFoodModal
          food={null}
          open={!!addingFoodToMealType}
          initialMealType={addingFoodToMealType}
          onClose={() => {
            setAddingFoodToMealType(null);
          }}
        />
      )}
    </div>
  );
}
