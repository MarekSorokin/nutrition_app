'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addFoodToMeal } from '@/app/actions/meals';
import { toast } from 'sonner';
import { MealType } from '@prisma/client';
import type { Product } from '@/types/food';
import { useMealsStore } from '@/lib/store/meals-store';
import { useUserStore } from '@/lib/store/user-store';

interface AddFoodModalProps {
  food: Product | null;
  open: boolean;
  onClose: () => void;
  initialMealType?: MealType;
}

export function AddFoodModal({ food, open, onClose, initialMealType }: AddFoodModalProps) {
  const [amount, setAmount] = useState('100');
  const [mealType, setMealType] = useState<MealType>(initialMealType || MealType.BREAKFAST);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchMeals } = useMealsStore();
  const { user } = useUserStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!food || !user?.id) return;

    try {
      setIsSubmitting(true);
      const result = await addFoodToMeal({
        ...food,
        amount: Number(amount),
        mealType,
        calories: food.nutritionPer100g.calories,
        proteins: food.nutritionPer100g.proteins,
        carbs: food.nutritionPer100g.carbs,
        fats: food.nutritionPer100g.fats,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Food added successfully!');
      // Refresh meals data
      await fetchMeals(user.id);
      onClose();
    } catch (error) {
      toast.error('Failed to add food' + (error instanceof Error ? error.message : ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Food to Meal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (g)</label>
            <Input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Meal Type</label>
            <Select value={mealType} onValueChange={(value) => setMealType(value as MealType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(MealType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {food && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-medium">Nutrition per {amount}g</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  Calories: {Math.round((food.nutritionPer100g.calories * Number(amount)) / 100)}{' '}
                  kcal
                </div>
                <div>
                  Proteins: {Math.round((food.nutritionPer100g.proteins * Number(amount)) / 100)}g
                </div>
                <div>
                  Carbs: {Math.round((food.nutritionPer100g.carbs * Number(amount)) / 100)}g
                </div>
                <div>Fats: {Math.round((food.nutritionPer100g.fats * Number(amount)) / 100)}g</div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
              ) : (
                'Add to Meal'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
