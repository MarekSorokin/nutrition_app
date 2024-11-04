export interface NutritionPer100g {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber?: number;
}

export interface Product {
  name: string;
  image?: string;
  nutritionPer100g: NutritionPer100g;
  brand?: string;
  isCzech?: boolean;
  canBeSaved?: boolean;
}

export interface SearchResults {
  fromDb: boolean;
  total?: number;
  products: Product[];
}

export interface SaveFoodInput {
  name: string;
  brand?: string;
  image?: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

// API types
export interface OpenFoodFactsProduct {
  product_name: string;
  image_url?: string;
  nutriments: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
  };
  nutrition_grades?: string;
  brands?: string;
  quantity?: string;
  countries_tags?: string[];
}

export interface OpenFoodFactsResponse {
  count: number;
  page: number;
  products: OpenFoodFactsProduct[];
}
