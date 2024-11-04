'use server'

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { OpenFoodFactsProduct, OpenFoodFactsResponse, Product, SaveFoodInput, SearchResults } from "@/types/food"

// Validation schemas
const foodSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  image: z.string().url().optional(),
  calories: z.number().min(0),
  proteins: z.number().min(0),
  carbs: z.number().min(0),
  fats: z.number().min(0),
})

// Helper functions
const transformOpenFoodFactsProduct = (product: OpenFoodFactsProduct, isCzech = false): Product => ({
  name: product.product_name,
  image: product.image_url,
  nutritionPer100g: {
    calories: Number(product.nutriments['energy-kcal_100g'] || 0),
    proteins: Number(product.nutriments.proteins_100g || 0),
    carbs: Number(product.nutriments.carbohydrates_100g || 0),
    fats: Number(product.nutriments.fat_100g || 0),
    fiber: Number(product.nutriments.fiber_100g || 0),
  },
  brand: product.brands,
  isCzech,
  canBeSaved: true,
})

// API functions
async function fetchOpenFoodFactsProducts(query: string, isOnlyCzech = false): Promise<OpenFoodFactsResponse> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '5',
    fields: 'product_name,image_url,nutriments,nutrition_grades,brands,quantity,countries_tags',
  })

  if (isOnlyCzech) {
    params.append('tagtype_0', 'countries')
    params.append('tag_contains_0', 'contains')
    params.append('tag_0', 'czech-republic')
    params.append('sort_by', 'popularity_key')
  }

  const response = await fetch(
    `https://world.openfoodfacts.org/cgi/search.pl?${params}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch from Open Food Facts')
  }

  return response.json()
}

// Main functions
export async function getFoodFromDb(name: string) {
  if (!name?.trim()) return null

  try {
    return await prisma.food.findFirst({
      where: {
        OR: [
          { name: { contains: name.trim(), mode: 'insensitive' } },
          { brand: { contains: name.trim(), mode: 'insensitive' } }
        ]
      },
    })
  } catch (error) {
    console.error('Database search error:', error)
    return null
  }
}

export async function saveFood(data: SaveFoodInput) {
  try {
    const validatedData = foodSchema.parse(data)
    
    const food = await prisma.food.create({
      data: validatedData
    })

    revalidatePath('/')
    return { success: true, food }
  } catch (error) {
    console.error('Failed to save food:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid food data' }
    }
    return { success: false, error: 'Failed to save food' }
  }
}

export async function searchFood(query: string): Promise<SearchResults> {
  if (!query?.trim()) {
    return { fromDb: false, products: [] }
  }

  // First check in database
  const dbFood = await getFoodFromDb(query)
  if (dbFood) {
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
        brand: dbFood.brand || undefined,
        canBeSaved: false,
      }]
    }
  }

  return { fromDb: false, products: [] }
}

export async function searchOnline(query: string, currentResults: SearchResults): Promise<SearchResults> {
  try {
    try {
      const [czechData, worldData] = await Promise.all([
        fetchOpenFoodFactsProducts(query, true),
        fetchOpenFoodFactsProducts(query),
      ])
  
      const czechProducts = czechData.products.map(p => transformOpenFoodFactsProduct(p, true))
      const worldProducts = worldData.products
        .filter(wp => !czechData.products.some(cp => cp.product_name === wp.product_name))
        .map(p => transformOpenFoodFactsProduct(p, false))
  
      return {
        fromDb: false,
        total: czechData.count + worldData.count,
        products: [...czechProducts, ...worldProducts]
      }
    } catch (error) {
      console.error('Search error:', error)
      return { fromDb: false, products: [] }
    }
  } catch (error) {
    console.error('Online search error:', error)
    throw new Error('Failed to fetch online results')
  }
}