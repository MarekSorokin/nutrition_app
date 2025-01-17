import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateFood } from '@/app/actions/foods';
import { toast } from 'sonner';
import { Barcode } from 'lucide-react';
import { BarcodeScanner } from './barcode-scanner';

interface Food {
  id: string;
  name: string;
  brand: string | null;
  image: string | null;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  barcode: string | null;
}

interface EditFoodModalProps {
  food: Food;
  onClose: () => void;
}

export function EditFoodModal({ food, onClose }: EditFoodModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    name: food.name,
    brand: food.brand || '',
    image: food.image || '',
    calories: food.calories.toString(),
    proteins: food.proteins.toString(),
    carbs: food.carbs.toString(),
    fats: food.fats.toString(),
    barcode: food.barcode || '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const result = await updateFood({
        id: food.id,
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

      toast.success('Food updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update food');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBarcodeScanned = (barcode: string) => {
    setFormData((prev) => ({ ...prev, barcode }));
    setShowScanner(false);
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Food</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Barcode</label>
              <div className="flex gap-2">
                <Input
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder="Scan or enter barcode"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowScanner(true)}
                >
                  <Barcode className="size-4" />
                </Button>
              </div>
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
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {showScanner && (
        <BarcodeScanner onClose={() => setShowScanner(false)} onScan={handleBarcodeScanned} />
      )}
    </>
  );
}
