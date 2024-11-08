'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Product } from '@/types/food';
import { MealType } from '@prisma/client';
import { addFoodToMeal } from '@/app/actions/meals';
import { toast } from 'sonner';
import { useMealsStore } from '@/lib/store/meals-store';
import { useUserStore } from '@/lib/store/user-store';

interface AddFoodModalProps {
  food: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function AddFoodModal({ food, isOpen, onClose }: AddFoodModalProps) {
  const [amount, setAmount] = useState('100');
  const [mealType, setMealType] = useState<MealType>(MealType.SNACK);
  const [isSaving, setIsSaving] = useState(false);
  const { fetchMeals } = useMealsStore();
  const { user } = useUserStore();
  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const result = await addFoodToMeal({
        name: food.name,
        brand: food.brand,
        image: food.image,
        calories: food.nutritionPer100g.calories,
        proteins: food.nutritionPer100g.proteins,
        carbs: food.nutritionPer100g.carbs,
        fats: food.nutritionPer100g.fats,
        amount: Number(amount),
        mealType,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (user?.id) {
        await fetchMeals(user.id);
      }
      toast.success('Food added to meal!');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to add food to meal', { description: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to meal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (g)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Meal</label>
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
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Nutrition per {amount}g</h4>
            <div className="text-sm text-muted-foreground">
              <p>Calories: {Math.round((food.nutritionPer100g.calories * Number(amount)) / 100)}</p>
              <p>
                Protein: {((food.nutritionPer100g.proteins * Number(amount)) / 100).toFixed(1)}g
              </p>
              <p>Carbs: {((food.nutritionPer100g.carbs * Number(amount)) / 100).toFixed(1)}g</p>
              <p>Fat: {((food.nutritionPer100g.fats * Number(amount)) / 100).toFixed(1)}g</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <div className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
            ) : (
              'Add to meal'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
