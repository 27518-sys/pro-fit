import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse, successResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return unauthorizedResponse();

  const today = new Date().toISOString().split('T')[0];

  // Parallel data fetching for instant response
  const [
    profile,
    settings,
    totalWorkouts,
    workoutSessions,
    todayNutrition,
    todayWater,
    hydrationTarget,
    activeGoals,
    recentPRs,
    unreadNotifications,
  ] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: authUser.id } }),
    prisma.personalSettings.findUnique({ where: { userId: authUser.id } }),
    prisma.workoutSession.count({ where: { userId: authUser.id, status: 'COMPLETED' } }),
    prisma.workoutSession.findMany({
      where: { userId: authUser.id },
      orderBy: { startedAt: 'desc' },
      take: 7,
      include: {
        exercises: { include: { exercise: true, sets: true } },
      },
    }),
    prisma.nutritionLog.findMany({
      where: { userId: authUser.id, date: today },
    }),
    prisma.waterLog.findMany({
      where: { userId: authUser.id, date: today },
    }),
    prisma.hydrationTarget.findUnique({ where: { userId: authUser.id } }),
    prisma.fitnessGoal.findMany({
      where: { userId: authUser.id, isCompleted: false },
      take: 4,
    }),
    prisma.personalRecord.findMany({
      where: { userId: authUser.id },
      include: { exercise: true },
      orderBy: { achievedAt: 'desc' },
      take: 4,
    }),
    prisma.notification.count({
      where: { userId: authUser.id, isRead: false },
    }),
  ]);

  // Aggregate totals
  const totalVolumeKg = workoutSessions.reduce((sum, s) => sum + (s.totalVolumeKg || 0), 0);
  const totalCaloriesBurned = workoutSessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0);

  // Today nutrition totals
  const consumedCalories = todayNutrition.reduce((sum, item) => sum + item.calories, 0);
  const consumedProtein = todayNutrition.reduce((sum, item) => sum + item.proteinG, 0);
  const consumedCarbs = todayNutrition.reduce((sum, item) => sum + item.carbsG, 0);
  const consumedFat = todayNutrition.reduce((sum, item) => sum + item.fatG, 0);

  // Today water totals
  const consumedWaterMl = todayWater.reduce((sum, item) => sum + item.amountMl, 0);
  const targetWaterMl = hydrationTarget?.dailyTargetMl || profile?.dailyWaterTargetMl || 3000;

  // Chart data: past 7 days volume & workouts
  const daysMap: Record<string, { date: string; volume: number; calories: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    daysMap[dateStr] = { date: dayLabel, volume: 0, calories: 0 };
  }

  workoutSessions.forEach((s) => {
    const dStr = s.startedAt.toISOString().split('T')[0];
    if (daysMap[dStr]) {
      daysMap[dStr].volume += s.totalVolumeKg || 0;
      daysMap[dStr].calories += s.caloriesBurned || 0;
    }
  });

  const weeklyTrend = Object.values(daysMap);

  return successResponse({
    user: {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
    },
    profile,
    settings,
    stats: {
      totalWorkouts,
      totalVolumeKg: Math.round(totalVolumeKg),
      totalCaloriesBurned,
      unreadNotifications,
    },
    nutrition: {
      calories: consumedCalories,
      targetCalories: profile?.dailyCalorieTarget || 2200,
      protein: Math.round(consumedProtein),
      targetProtein: profile?.dailyProteinTargetG || 140,
      carbs: Math.round(consumedCarbs),
      targetCarbs: profile?.dailyCarbTargetG || 250,
      fat: Math.round(consumedFat),
      targetFat: profile?.dailyFatTargetG || 65,
      itemsCount: todayNutrition.length,
    },
    hydration: {
      currentMl: consumedWaterMl,
      targetMl: targetWaterMl,
      progressPercent: Math.min(100, Math.round((consumedWaterMl / targetWaterMl) * 100)),
    },
    weeklyTrend,
    activeGoals,
    recentPRs,
    recentSessions: workoutSessions.slice(0, 3),
  });
}
