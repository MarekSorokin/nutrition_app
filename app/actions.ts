'use server'

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { z } from "zod" // You'll need to add zod to your dependencies

// Validation schema for food data
const foodSchema = z.object({
  name: z.string(),
  brand: z.string().optional(),
  image: z.string().optional(),
  calories: z.number(),
  proteins: z.number(),
  carbs: z.number(),
  fats: z.number(),
})

// First, let's add a function to check if food exists in DB
export async function getFoodFromDb(name: string) {
  if (!name || typeof name !== 'string') {
    return null;
  }

  try {
    const food = await prisma.food.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: name.trim(),
              mode: 'insensitive', // Case insensitive search
            }
          },
          {
            brand: {
              equals: name.trim(),
              mode: 'insensitive', // Case insensitive search
            }
          }
        ]
      },
    })
    return food
  } catch (error) {
    console.error('Database search error:', error)
    return null
  }
}

// Function to save food to DB
export async function saveFood(
  data: z.infer<typeof foodSchema>
) {
  try {
    // Validate the input data
    const validatedData = foodSchema.parse({
      name: data.name,
      brand: data.brand,
      image: data.image,
      calories: Number(data.calories),
      proteins: Number(data.proteins),
      carbs: Number(data.carbs),
      fats: Number(data.fats),
    });

    // Create food record with only the fields that exist in the schema
    const food = await prisma.food.create({
      data: {
        name: validatedData.name,
        brand: validatedData.brand,
        image: validatedData.image,
        calories: validatedData.calories,
        proteins: validatedData.proteins,
        carbs: validatedData.carbs,
        fats: validatedData.fats,
      }
    })

    revalidatePath('/')
    return { success: true, food }
  } catch (error) {
    console.error('Failed to save food:', error)
    return { success: false, error: 'Failed to save food' }
  }
}

// Types for Open Food Facts API response
interface ProductResponse {
  count: number;
  page: number;
  products: Array<{
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
  }>;
}

// Modified search function
export async function searchFood(query: string) {
  if (!query?.trim()) {
    return {
      fromDb: false,
      products: []
    };
  }

  // First check in database
  const dbFood = await getFoodFromDb(query)
  if (dbFood) {
    // Transform database food to match API format
    return {
      fromDb: true,
      products: [{
        name: dbFood.name,
        image: dbFood.image || undefined,
        nutritionPer100g: {
          calories: dbFood.calories,
          proteins: dbFood.proteins,
          carbs: dbFood.carbs,
          fats: dbFood.fats,
        },
        brand: dbFood.brand || 'Unknown brand',
        canBeSaved: false, // Already in database
        isCzech: false, // We don't store this info in DB
      }]
    }
  }

  try {
    // First, try to search specifically in Czech products
    const czechResponse = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?` + 
      new URLSearchParams({
        search_terms: query,
        search_simple: '1',
        action: 'process',
        json: '1',
        page_size: '5',
        tagtype_0: 'countries',
        tag_contains_0: 'contains',
        tag_0: 'czech-republic',
        sort_by: 'popularity_key',  // Sort by popularity
        fields: 'product_name,image_url,nutriments,nutrition_grades,brands,quantity,countries_tags'
      })
    );

    // Then get worldwide products as a fallback
    const worldResponse = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?` +
      new URLSearchParams({
        search_terms: query,
        search_simple: '1',
        action: 'process',
        json: '1',
        page_size: '5',
        fields: 'product_name,image_url,nutriments,nutrition_grades,brands,quantity,countries_tags'
      })
    );

    if (!czechResponse.ok || !worldResponse.ok) {
      throw new Error('Failed to fetch data from Open Food Facts');
    }

    const czechData: ProductResponse = await czechResponse.json();
    const worldData: ProductResponse = await worldResponse.json();

    // Combine and format the results
    const allProducts = [
      ...czechData.products.map(product => ({
        ...product,
        isCzech: true
      })),
      ...worldData.products
        .filter(worldProduct => 
          // Filter out products that are already in Czech results
          !czechData.products.some(czechProduct => 
            czechProduct.product_name === worldProduct.product_name
          )
        )
        .map(product => ({
          ...product,
          isCzech: false
        }))
    ];

    // Transform the data to a more usable format
    const formattedResults = allProducts.map(product => ({
      name: product.product_name,
      image: product.image_url,
      nutritionPer100g: {
        calories: Number(product.nutriments['energy-kcal_100g'] || 0),
        proteins: Number(product.nutriments.proteins_100g || 0),
        carbs: Number(product.nutriments.carbohydrates_100g || 0),
        fats: Number(product.nutriments.fat_100g || 0),
        fiber: Number(product.nutriments.fiber_100g || 0),
      },
      nutritionGrade: product.nutrition_grades?.toUpperCase() || 'N/A',
      brand: product.brands || 'Unknown brand',
      quantity: product.quantity || 'N/A',
      isCzech: product.isCzech || false,
    }));

    // Modified return format to indicate source
    return {
      fromDb: false,
      total: czechData.count + worldData.count,
      page: 1,
      products: formattedResults.map(product => ({
        ...product,
        canBeSaved: true, // Flag to show save button in UI
      })),
    };

  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search food in Open Food Facts database');
  }
} 

// Add a new action for fetching online results
export async function searchOnline(query: string, existingResults: any) {
  try {
    const apiResults = await searchFood(query);
    
    // Combine database and API results
    return {
      fromDb: false, // Switch to show total count
      total: (apiResults.total || 0) + existingResults.products.length,
      products: [
        ...existingResults.products, // Keep database results
        ...(apiResults.products || []) // Add API results
      ]
    };
  } catch (error) {
    console.error('Online search failed:', error);
    throw new Error('Failed to fetch online results');
  }
}