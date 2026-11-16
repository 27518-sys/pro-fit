import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return badRequestResponse('Message is required');
    }

    // Retrieve user context for personalized AI coaching
    const [profile, recentWorkouts, goals, prs] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId: authUser.id } }),
      prisma.workoutSession.findMany({
        where: { userId: authUser.id },
        orderBy: { startedAt: 'desc' },
        take: 3,
        include: { exercises: { include: { exercise: true } } },
      }),
      prisma.fitnessGoal.findMany({
        where: { userId: authUser.id, isCompleted: false },
        take: 2,
      }),
      prisma.personalRecord.findMany({
        where: { userId: authUser.id },
        include: { exercise: true },
        take: 2,
      }),
    ]);

    // Intelligent context-aware AI Coach response generator
    const goalSummary = goals.map((g) => `${g.title} (${g.progressPercent}% completed)`).join(', ') || 'General fitness';
    const prSummary = prs.map((p) => `${p.exercise?.name}: ${p.value}${p.unit}`).join(', ') || 'None logged yet';
    const userGoal = profile?.fitnessGoal || 'BUILD_MUSCLE';

    let coachAdvice = '';
    const qLower = message.toLowerCase();

    if (qLower.includes('protein') || qLower.includes('calorie') || qLower.includes('eat') || qLower.includes('diet') || qLower.includes('nutrition')) {
      coachAdvice = `Based on your goal to **${userGoal.replace('_', ' ')}**, your daily target is **${profile?.dailyCalorieTarget || 2400} kcal** with **${profile?.dailyProteinTargetG || 150}g protein**. Aim for ~1.6g–2.2g of protein per kg of bodyweight. Consume 30–40g of protein within 2 hours post-workout to maximize muscle protein synthesis and glycogen replenishment.`;
    } else if (qLower.includes('plateau') || qLower.includes('heavy') || qLower.includes('stuck') || qLower.includes('pr') || qLower.includes('bench') || qLower.includes('squat')) {
      coachAdvice = `Looking at your recent PRs (${prSummary}), you have solid momentum! To break through strength plateaus, implement **microloading** (+1.25kg to 2.5kg per week), focus on eccentric control (3-second tempo down), and ensure your rest intervals between heavy compound sets are a full **2.5 to 3.5 minutes**.`;
    } else if (qLower.includes('sore') || qLower.includes('recovery') || qLower.includes('rest') || qLower.includes('sleep') || qLower.includes('water')) {
      coachAdvice = `Recovery is where adaptations happen! Ensure you hit your hydration target (**${profile?.dailyWaterTargetMl || 3000} ml/day**), prioritize 7.5–9 hours of sleep, and consider light active recovery (e.g., 20-minute zone-2 walk or gentle hip/thoracic mobility work) to clear metabolic waste and reduce DOMS.`;
    } else {
      coachAdvice = `Hello ${authUser.name}! I reviewed your current fitness profile: Goal: **${userGoal}**, Weight: **${profile?.currentWeightKg || 75} kg** (target: ${profile?.targetWeightKg || 70} kg), Active Goals: ${goalSummary}. 
Keep focusing on progressive overload in your compound movements, hit your daily macronutrient targets, and maintain workout frequency. What specific question can I assist you with today—workout splits, exercise form, or meal timing?`;
    }

    return successResponse({
      reply: coachAdvice,
      timestamp: new Date().toISOString(),
      userContext: {
        fitnessGoal: userGoal,
        targetCalories: profile?.dailyCalorieTarget,
        recentWorkoutsCount: recentWorkouts.length,
      },
    });
  } catch (error: any) {
    return badRequestResponse(error.message || 'AI coach encountered an error');
  }
}
