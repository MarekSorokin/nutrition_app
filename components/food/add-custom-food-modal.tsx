import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveFood } from '@/app/actions';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store/app-store';

interface AddCustomFoodModalProps {
  barcode?: string;
  onClose: () => void;
}

export function AddCustomFoodModal({ barcode, onClose }: AddCustomFoodModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setSearchResults, setDisplaySearchResults } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    image: '',
    calories: '',
    proteins: '',
    carbs: '',
    fats: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const result = await saveFood({
        ...formData,
        calories: Number(formData.calories),
        proteins: Number(formData.proteins),
        carbs: Number(formData.carbs),
        fats: Number(formData.fats),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Food added successfully!');

      // Update search results to show the newly added food
      if (result.food) {
        setSearchResults({
          fromDb: true,
          products: [
            {
              name: result.food.name,
              brand: result.food.brand || undefined,
              image: result.food.image || undefined,
              nutritionPer100g: {
                calories: result.food.calories,
                proteins: result.food.proteins,
                carbs: result.food.carbs,
                fats: result.food.fats,
              },
              canBeSaved: false,
            },
          ],
        });
        setDisplaySearchResults(true);
      }

      onClose();
    } catch (error) {
      toast.error('Failed to add food');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Food</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {barcode && <div className="text-sm text-muted-foreground">Barcode: {barcode}</div>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Brand</label>
            <Input name="brand" value={formData.brand} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <Input
              name="image"
              type="url"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Calories (kcal/100g) *</label>
              <Input
                name="calories"
                type="number"
                min="0"
                step="1"
                value={formData.calories}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Proteins (g/100g) *</label>
              <Input
                name="proteins"
                type="number"
                min="0"
                step="0.1"
                value={formData.proteins}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Carbs (g/100g) *</label>
              <Input
                name="carbs"
                type="number"
                min="0"
                step="0.1"
                value={formData.carbs}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fats (g/100g) *</label>
              <Input
                name="fats"
                type="number"
                min="0"
                step="0.1"
                value={formData.fats}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
              ) : (
                'Save Food'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
