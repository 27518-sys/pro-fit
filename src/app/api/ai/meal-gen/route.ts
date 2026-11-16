import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const { calorieTarget, dietPreference, logToNutrition } = await req.json();

    const target = calorieTarget || 2200;
    const diet = dietPreference || 'BALANCED'; // BALANCED, HIGH_PROTEIN, KETO, VEGETARIAN
    const today = new Date().toISOString().split('T')[0];

    const mealPlans = [
      {
        mealType: 'BREAKFAST',
        foodName: diet === 'VEGETARIAN' ? 'Tofu Scramble with Avocado & Sprouted Toast' : 'Egg White & Whole Egg Omelet with Oats & Blueberries',
        calories: Math.round(target * 0.25),
        proteinG: Math.round(target * 0.25 * 0.07),
        carbsG: Math.round(target * 0.25 * 0.11),
        fatG: Math.round(target * 0.25 * 0.03),
        servingSize: 300,
        servingUnit: 'g',
        notes: 'Rich in micronutrients and steady morning energy',
      },
      {
        mealType: 'LUNCH',
        foodName: diet === 'VEGETARIAN' ? 'Chickpea & Quinoa Mediterranean Bowl' : 'Grilled Chicken Breast, Quinoa, & Steamed Asparagus',
        calories: Math.round(target * 0.35),
        proteinG: Math.round(target * 0.35 * 0.08),
        carbsG: Math.round(target * 0.35 * 0.10),
        fatG: Math.round(target * 0.35 * 0.035),
        servingSize: 450,
        servingUnit: 'g',
        notes: 'High bioavailable protein and complex carbohydrates',
      },
      {
        mealType: 'SNACK',
        foodName: diet === 'VEGETARIAN' ? 'Plant Protein Shake with Peanut Butter' : 'Greek Yogurt with Whey Protein, Chia Seeds & Walnuts',
        calories: Math.round(target * 0.15),
        proteinG: Math.round(target * 0.15 * 0.09),
        carbsG: Math.round(target * 0.15 * 0.07),
        fatG: Math.round(target * 0.15 * 0.04),
        servingSize: 220,
        servingUnit: 'g',
        notes: 'Pre-workout / mid-afternoon satiety booster',
      },
      {
        mealType: 'DINNER',
        foodName: diet === 'VEGETARIAN' ? 'Lentil Dal with Brown Basmati Rice & Broccoli' : 'Wild Salmon Fillet with Sweet Potato & Roasted Greens',
        calories: Math.round(target * 0.25),
        proteinG: Math.round(target * 0.25 * 0.08),
        carbsG: Math.round(target * 0.25 * 0.09),
        fatG: Math.round(target * 0.25 * 0.04),
        servingSize: 400,
        servingUnit: 'g',
        notes: 'Omega-3 fatty acids for joint and muscle recovery',
      },
    ];

    let loggedEntries: any[] = [];
    if (logToNutrition) {
      for (const meal of mealPlans) {
        const entry = await prisma.nutritionLog.create({
          data: {
            userId: authUser.id,
            date: today,
            mealType: meal.mealType,
            foodName: meal.foodName,
            calories: meal.calories,
            proteinG: meal.proteinG,
            carbsG: meal.carbsG,
            fatG: meal.fatG,
            servingSize: meal.servingSize,
            servingUnit: meal.servingUnit,
            notes: meal.notes,
          },
        });
        loggedEntries.push(entry);
      }
    }

    return successResponse({
      dailyTargetCalories: target,
      dietPreference: diet,
      totalProtein: mealPlans.reduce((s, m) => s + m.proteinG, 0),
      totalCarbs: mealPlans.reduce((s, m) => s + m.carbsG, 0),
      totalFat: mealPlans.reduce((s, m) => s + m.fatG, 0),
      meals: mealPlans,
      loggedCount: loggedEntries.length,
    });
  } catch (error: any) {
    return badRequestResponse(error.message || 'Failed to generate meal plan');
  }
}
