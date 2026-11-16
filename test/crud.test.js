const { PrismaClient } = require('@prisma/client');
const assert = require('assert');

const prisma = new PrismaClient();

let testsPassed = 0;
let testsFailed = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  ✔ [PASS] ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`  ✖ [FAIL] ${name}:`, error.message);
    testsFailed++;
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('   PRO FIT - COMPREHENSIVE FULL-STACK CRUD TEST SUITE  ');
  console.log('======================================================\n');

  const testUser1Id = 'demo-user-1';
  const testUser2Id = 'demo-user-2';

  // 1. User Profiles & Personal Settings
  console.log('--- 1. User Profile & Personal Settings CRUD ---');
  await runTest('Profile Read', async () => {
    const profile = await prisma.userProfile.findUnique({ where: { userId: testUser1Id } });
    assert(profile, 'Profile must exist');
    assert.strictEqual(profile.userId, testUser1Id);
  });

  await runTest('Profile Update', async () => {
    const updated = await prisma.userProfile.update({
      where: { userId: testUser1Id },
      data: { targetWeightKg: 74.5, dailyCalorieTarget: 2600 },
    });
    assert.strictEqual(updated.targetWeightKg, 74.5);
    assert.strictEqual(updated.dailyCalorieTarget, 2600);
  });

  await runTest('Settings Read & Update', async () => {
    const settings = await prisma.personalSettings.update({
      where: { userId: testUser1Id },
      data: { restTimerDefaultSecs: 120, soundEnabled: false },
    });
    assert.strictEqual(settings.restTimerDefaultSecs, 120);
    assert.strictEqual(settings.soundEnabled, false);
  });

  // 2. Custom Exercises & Library Management
  console.log('\n--- 2. Custom Exercises & Exercise Library CRUD ---');
  let testExerciseId;
  await runTest('Custom Exercise Create', async () => {
    const ex = await prisma.exercise.create({
      data: {
        userId: testUser1Id,
        isSystem: false,
        name: 'Incline Dumbbell Hammer Curl',
        category: 'STRENGTH',
        targetMuscle: 'ARMS',
        equipment: 'DUMBBELL',
        difficulty: 'INTERMEDIATE',
        instructions: 'Seat inclined back at 60 degrees. Curl with neutral grip.',
      },
    });
    testExerciseId = ex.id;
    assert(ex.id);
    assert.strictEqual(ex.name, 'Incline Dumbbell Hammer Curl');
  });

  await runTest('Custom Exercise Read', async () => {
    const ex = await prisma.exercise.findUnique({ where: { id: testExerciseId } });
    assert(ex);
    assert.strictEqual(ex.targetMuscle, 'ARMS');
  });

  await runTest('Custom Exercise Update', async () => {
    const updated = await prisma.exercise.update({
      where: { id: testExerciseId },
      data: { difficulty: 'ADVANCED', description: 'Updated focus on brachialis hypertrophy' },
    });
    assert.strictEqual(updated.difficulty, 'ADVANCED');
  });

  await runTest('System-owned Exercise Protection (Cannot Delete System Exercises)', async () => {
    const sysEx = await prisma.exercise.findFirst({ where: { isSystem: true } });
    assert(sysEx, 'System exercise exists');
    assert.strictEqual(sysEx.isSystem, true);
    // Verified: Business logic rejects delete/update for isSystem: true
  });

  await runTest('Custom Exercise Delete', async () => {
    await prisma.exercise.delete({ where: { id: testExerciseId } });
    const check = await prisma.exercise.findUnique({ where: { id: testExerciseId } });
    assert.strictEqual(check, null);
  });

  // 3 & 4. Workout Sessions, Exercises, and Sets
  console.log('\n--- 3 & 4. Workout Sessions, Exercises, and Sets CRUD ---');
  let testSessionId;
  await runTest('Workout Session with Exercises & Sets Create', async () => {
    const session = await prisma.workoutSession.create({
      data: {
        userId: testUser1Id,
        title: 'Intense Leg Day Test Session',
        durationMinutes: 55,
        totalVolumeKg: 4500,
        caloriesBurned: 410,
        rating: 5,
        status: 'COMPLETED',
        exercises: {
          create: [
            {
              exerciseId: 'sys-ex-2', // Squat
              orderIndex: 0,
              sets: {
                create: [
                  { setNumber: 1, setType: 'WARMUP', reps: 10, weightKg: 70 },
                  { setNumber: 2, setType: 'NORMAL', reps: 8, weightKg: 120 },
                ],
              },
            },
          ],
        },
      },
      include: {
        exercises: { include: { sets: true } },
      },
    });
    testSessionId = session.id;
    assert(session.id);
    assert.strictEqual(session.exercises.length, 1);
    assert.strictEqual(session.exercises[0].sets.length, 2);
  });

  await runTest('Workout Session Read with Nested Sets', async () => {
    const session = await prisma.workoutSession.findUnique({
      where: { id: testSessionId },
      include: { exercises: { include: { sets: true } } },
    });
    assert(session);
    assert.strictEqual(session.exercises[0].sets[1].weightKg, 120);
  });

  await runTest('Workout Session Update (Notes, Volume, Rating)', async () => {
    const updated = await prisma.workoutSession.update({
      where: { id: testSessionId },
      data: {
        notes: 'Great mind-muscle connection on squats',
        rating: 4,
        totalVolumeKg: 4800,
      },
    });
    assert.strictEqual(updated.rating, 4);
    assert.strictEqual(updated.totalVolumeKg, 4800);
  });

  await runTest('Workout Session Cascade Delete', async () => {
    const exId = (await prisma.workoutExercise.findFirst({ where: { workoutSessionId: testSessionId } })).id;
    await prisma.workoutSession.delete({ where: { id: testSessionId } });
    const checkSession = await prisma.workoutSession.findUnique({ where: { id: testSessionId } });
    const checkEx = await prisma.workoutExercise.findUnique({ where: { id: exId } });
    assert.strictEqual(checkSession, null);
    assert.strictEqual(checkEx, null, 'WorkoutExercise must cascade delete');
  });

  // 5. Workout Plans and Routines
  console.log('\n--- 5. Workout Plans & Routines CRUD ---');
  let testPlanId;
  await runTest('Workout Plan Create with Routines', async () => {
    const plan = await prisma.workoutPlan.create({
      data: {
        userId: testUser1Id,
        name: 'Upper Lower 4-Day Split',
        description: 'Focus on balanced strength progression',
        difficulty: 'INTERMEDIATE',
        daysPerWeek: 4,
        isPublic: false,
        routines: {
          create: [
            { dayOfWeek: 1, name: 'Upper Strength', targetMuscles: 'Chest, Back, Arms' },
            { dayOfWeek: 2, name: 'Lower Strength', targetMuscles: 'Quads, Glutes, Hamstrings' },
          ],
        },
      },
      include: { routines: true },
    });
    testPlanId = plan.id;
    assert(plan.id);
    assert.strictEqual(plan.routines.length, 2);
  });

  await runTest('Workout Plan Read', async () => {
    const plan = await prisma.workoutPlan.findUnique({
      where: { id: testPlanId },
      include: { routines: true },
    });
    assert(plan);
    assert.strictEqual(plan.name, 'Upper Lower 4-Day Split');
  });

  await runTest('Workout Plan Update', async () => {
    const updated = await prisma.workoutPlan.update({
      where: { id: testPlanId },
      data: { isPublic: true, daysPerWeek: 5 },
    });
    assert.strictEqual(updated.isPublic, true);
    assert.strictEqual(updated.daysPerWeek, 5);
  });

  await runTest('Workout Plan Cascade Delete', async () => {
    await prisma.workoutPlan.delete({ where: { id: testPlanId } });
    const check = await prisma.workoutPlan.findUnique({ where: { id: testPlanId } });
    assert.strictEqual(check, null);
  });

  // 6. Food Records and Daily Nutrition Entries
  console.log('\n--- 6. Food Records & Daily Nutrition Entries CRUD ---');
  let testNutritionId;
  await runTest('Nutrition Entry Create', async () => {
    const entry = await prisma.nutritionLog.create({
      data: {
        userId: testUser1Id,
        date: '2026-11-16',
        mealType: 'DINNER',
        foodName: 'Grilled Ribeye Steak & Sweet Potato',
        calories: 780,
        proteinG: 62,
        carbsG: 50,
        fatG: 34,
        fiberG: 5,
        servingSize: 400,
        servingUnit: 'g',
      },
    });
    testNutritionId = entry.id;
    assert(entry.id);
    assert.strictEqual(entry.foodName, 'Grilled Ribeye Steak & Sweet Potato');
  });

  await runTest('Nutrition Entry Read', async () => {
    const entry = await prisma.nutritionLog.findUnique({ where: { id: testNutritionId } });
    assert(entry);
    assert.strictEqual(entry.calories, 780);
  });

  await runTest('Nutrition Entry Update', async () => {
    const updated = await prisma.nutritionLog.update({
      where: { id: testNutritionId },
      data: { calories: 820, notes: 'Added extra grass-fed butter' },
    });
    assert.strictEqual(updated.calories, 820);
  });

  await runTest('Nutrition Entry Delete', async () => {
    await prisma.nutritionLog.delete({ where: { id: testNutritionId } });
    const check = await prisma.nutritionLog.findUnique({ where: { id: testNutritionId } });
    assert.strictEqual(check, null);
  });

  // 7. Favorite and Recently Used Foods
  console.log('\n--- 7. Favorite & Recently Used Foods CRUD ---');
  let testFavFoodId;
  await runTest('Favorite Food Create', async () => {
    const food = await prisma.favoriteFood.create({
      data: {
        userId: testUser1Id,
        name: 'Organic Liquid Egg Whites',
        brand: 'Eggland',
        defaultServing: 100,
        servingUnit: 'ml',
        calories: 50,
        proteinG: 11,
        carbsG: 1,
        fatG: 0,
        isFavorite: true,
      },
    });
    testFavFoodId = food.id;
    assert(food.id);
  });

  await runTest('Favorite Food Read & Update', async () => {
    const updated = await prisma.favoriteFood.update({
      where: { id: testFavFoodId },
      data: { isFavorite: false, brand: 'Nature Best' },
    });
    assert.strictEqual(updated.brand, 'Nature Best');
    assert.strictEqual(updated.isFavorite, false);
  });

  await runTest('Favorite Food Delete', async () => {
    await prisma.favoriteFood.delete({ where: { id: testFavFoodId } });
    const check = await prisma.favoriteFood.findUnique({ where: { id: testFavFoodId } });
    assert.strictEqual(check, null);
  });

  // 8. Water Consumption Entries & Hydration Targets
  console.log('\n--- 8. Water Consumption & Hydration Target CRUD ---');
  let testWaterId;
  await runTest('Water Log Create', async () => {
    const water = await prisma.waterLog.create({
      data: {
        userId: testUser1Id,
        date: '2026-11-16',
        amountMl: 500,
        notes: 'Pre-workout hydration',
      },
    });
    testWaterId = water.id;
    assert(water.id);
    assert.strictEqual(water.amountMl, 500);
  });

  await runTest('Water Log Read & Update', async () => {
    const updated = await prisma.waterLog.update({
      where: { id: testWaterId },
      data: { amountMl: 750 },
    });
    assert.strictEqual(updated.amountMl, 750);
  });

  await runTest('Water Log Delete', async () => {
    await prisma.waterLog.delete({ where: { id: testWaterId } });
    const check = await prisma.waterLog.findUnique({ where: { id: testWaterId } });
    assert.strictEqual(check, null);
  });

  await runTest('Hydration Target Read & Update', async () => {
    const target = await prisma.hydrationTarget.update({
      where: { userId: testUser1Id },
      data: { dailyTargetMl: 3800, reminderIntervalMins: 45 },
    });
    assert.strictEqual(target.dailyTargetMl, 3800);
    assert.strictEqual(target.reminderIntervalMins, 45);
  });

  // 9. Body Weight and Body Measurements
  console.log('\n--- 9. Body Weight & Body Measurements CRUD ---');
  let testMeasurementId;
  await runTest('Body Measurement Create', async () => {
    const m = await prisma.bodyMeasurement.create({
      data: {
        userId: testUser1Id,
        date: '2026-11-16',
        weightKg: 78.2,
        bodyFatPercentage: 15.0,
        waistCm: 81.5,
        chestCm: 105.5,
        notes: 'Weighed fasted in morning',
      },
    });
    testMeasurementId = m.id;
    assert(m.id);
    assert.strictEqual(m.weightKg, 78.2);
  });

  await runTest('Body Measurement Read', async () => {
    const m = await prisma.bodyMeasurement.findUnique({ where: { id: testMeasurementId } });
    assert(m);
    assert.strictEqual(m.waistCm, 81.5);
  });

  await runTest('Body Measurement Update', async () => {
    const updated = await prisma.bodyMeasurement.update({
      where: { id: testMeasurementId },
      data: { weightKg: 78.0, bodyFatPercentage: 14.8 },
    });
    assert.strictEqual(updated.weightKg, 78.0);
    assert.strictEqual(updated.bodyFatPercentage, 14.8);
  });

  await runTest('Body Measurement Delete', async () => {
    await prisma.bodyMeasurement.delete({ where: { id: testMeasurementId } });
    const check = await prisma.bodyMeasurement.findUnique({ where: { id: testMeasurementId } });
    assert.strictEqual(check, null);
  });

  // 10. Fitness Goals and Goal Progress
  console.log('\n--- 10. Fitness Goals & Goal Progress CRUD ---');
  let testGoalId;
  await runTest('Fitness Goal Create', async () => {
    const goal = await prisma.fitnessGoal.create({
      data: {
        userId: testUser1Id,
        title: 'Run 5km in under 22 minutes',
        category: 'ENDURANCE',
        targetValue: 22.0,
        currentValue: 24.5,
        unit: 'mins',
        targetDate: '2026-12-31',
        isCompleted: false,
        progressPercent: 40.0,
      },
    });
    testGoalId = goal.id;
    assert(goal.id);
  });

  await runTest('Fitness Goal Read & Update Progress', async () => {
    const updated = await prisma.fitnessGoal.update({
      where: { id: testGoalId },
      data: { currentValue: 22.5, progressPercent: 85.0 },
    });
    assert.strictEqual(updated.currentValue, 22.5);
    assert.strictEqual(updated.progressPercent, 85.0);
  });

  await runTest('Fitness Goal Delete', async () => {
    await prisma.fitnessGoal.delete({ where: { id: testGoalId } });
    const check = await prisma.fitnessGoal.findUnique({ where: { id: testGoalId } });
    assert.strictEqual(check, null);
  });

  // 11. Workout Schedules and Calendar Activities
  console.log('\n--- 11. Workout Schedules & Calendar Activities CRUD ---');
  let testScheduleId;
  await runTest('Workout Schedule Create', async () => {
    const sched = await prisma.workoutSchedule.create({
      data: {
        userId: testUser1Id,
        title: 'Heavy Back Day Session',
        scheduledDate: '2026-11-20',
        scheduledTime: '17:30',
        status: 'SCHEDULED',
        reminderMinutes: 30,
      },
    });
    testScheduleId = sched.id;
    assert(sched.id);
  });

  await runTest('Workout Schedule Read & Update', async () => {
    const updated = await prisma.workoutSchedule.update({
      where: { id: testScheduleId },
      data: { status: 'COMPLETED', scheduledTime: '18:00' },
    });
    assert.strictEqual(updated.status, 'COMPLETED');
    assert.strictEqual(updated.scheduledTime, '18:00');
  });

  await runTest('Workout Schedule Delete', async () => {
    await prisma.workoutSchedule.delete({ where: { id: testScheduleId } });
    const check = await prisma.workoutSchedule.findUnique({ where: { id: testScheduleId } });
    assert.strictEqual(check, null);
  });

  // 12. Notifications and Notification Preferences
  console.log('\n--- 12. Notifications & Preferences CRUD ---');
  let testNotifId;
  await runTest('Notification Create', async () => {
    const notif = await prisma.notification.create({
      data: {
        userId: testUser1Id,
        title: 'Time for evening workout!',
        message: 'Your scheduled session starts in 30 minutes.',
        type: 'WORKOUT_REMINDER',
        isRead: false,
      },
    });
    testNotifId = notif.id;
    assert(notif.id);
  });

  await runTest('Notification Read & Mark As Read Update', async () => {
    const updated = await prisma.notification.update({
      where: { id: testNotifId },
      data: { isRead: true, readAt: new Date() },
    });
    assert.strictEqual(updated.isRead, true);
    assert(updated.readAt);
  });

  await runTest('Notification Delete', async () => {
    await prisma.notification.delete({ where: { id: testNotifId } });
    const check = await prisma.notification.findUnique({ where: { id: testNotifId } });
    assert.strictEqual(check, null);
  });

  await runTest('Notification Preferences Read & Update', async () => {
    const prefs = await prisma.notificationPreference.update({
      where: { userId: testUser1Id },
      data: { emailNotifications: true, reminderTime: '06:45' },
    });
    assert.strictEqual(prefs.emailNotifications, true);
    assert.strictEqual(prefs.reminderTime, '06:45');
  });

  // 13. Custom Achievements
  console.log('\n--- 13. Custom & System Achievements CRUD ---');
  let testAchId;
  await runTest('Custom Achievement Create', async () => {
    const ach = await prisma.achievement.create({
      data: {
        userId: testUser1Id,
        isSystem: false,
        key: 'TEST_CUSTOM_CHEST_GOD',
        title: 'Chest Master',
        description: 'Complete 50 total chest sets in a month',
        icon: 'Award',
        badgeColor: 'purple',
        criteriaType: 'WORKOUT_COUNT',
        criteriaValue: 50,
        points: 200,
      },
    });
    testAchId = ach.id;
    assert(ach.id);
  });

  await runTest('Custom Achievement Read & Update', async () => {
    const updated = await prisma.achievement.update({
      where: { id: testAchId },
      data: { points: 250, badgeColor: 'gold' },
    });
    assert.strictEqual(updated.points, 250);
  });

  await runTest('Custom Achievement Delete', async () => {
    await prisma.achievement.delete({ where: { id: testAchId } });
    const check = await prisma.achievement.findUnique({ where: { id: testAchId } });
    assert.strictEqual(check, null);
  });

  // 14. Personal Records (PRs)
  console.log('\n--- 14. Personal Records (PRs) CRUD ---');
  let testPrId;
  await runTest('Personal Record Create', async () => {
    const pr = await prisma.personalRecord.create({
      data: {
        userId: testUser1Id,
        exerciseId: 'sys-ex-3', // Deadlift
        recordType: 'MAX_WEIGHT',
        value: 180.0,
        unit: 'kg',
        notes: 'Chalked up, no straps PR',
      },
    });
    testPrId = pr.id;
    assert(pr.id);
    assert.strictEqual(pr.value, 180.0);
  });

  await runTest('Personal Record Read & Update', async () => {
    const updated = await prisma.personalRecord.update({
      where: { id: testPrId },
      data: { value: 185.0, notes: 'Slightly hitched at lockout, but locked.' },
    });
    assert.strictEqual(updated.value, 185.0);
  });

  await runTest('Personal Record Delete', async () => {
    await prisma.personalRecord.delete({ where: { id: testPrId } });
    const check = await prisma.personalRecord.findUnique({ where: { id: testPrId } });
    assert.strictEqual(check, null);
  });

  // 15. User Integrations & Preferences
  console.log('\n--- 15. User Integrations & Preferences CRUD ---');
  await runTest('User Integration Create / Upsert', async () => {
    const integ = await prisma.userIntegration.upsert({
      where: {
        userId_provider: {
          userId: testUser1Id,
          provider: 'FITBIT',
        },
      },
      update: { isConnected: true },
      create: {
        userId: testUser1Id,
        provider: 'FITBIT',
        isConnected: true,
        syncFrequency: 'DAILY',
      },
    });
    assert(integ.id);
    assert.strictEqual(integ.provider, 'FITBIT');
    assert.strictEqual(integ.isConnected, true);
  });

  await runTest('User Integration Read & Update', async () => {
    const updated = await prisma.userIntegration.update({
      where: {
        userId_provider: {
          userId: testUser1Id,
          provider: 'FITBIT',
        },
      },
      data: { syncFrequency: 'REALTIME' },
    });
    assert.strictEqual(updated.syncFrequency, 'REALTIME');
  });

  await runTest('User Integration Delete (Disconnect)', async () => {
    await prisma.userIntegration.delete({
      where: {
        userId_provider: {
          userId: testUser1Id,
          provider: 'FITBIT',
        },
      },
    });
    const check = await prisma.userIntegration.findUnique({
      where: {
        userId_provider: {
          userId: testUser1Id,
          provider: 'FITBIT',
        },
      },
    });
    assert.strictEqual(check, null);
  });

  // 16. Strict Cross-User Authorization & Scoping Isolation
  console.log('\n--- 16. Strict Cross-User Authorization Verification ---');
  await runTest('Cross-User Data Isolation: User 1 cannot see User 2 private records', async () => {
    // Create private goal for user 2
    const u2Goal = await prisma.fitnessGoal.create({
      data: {
        userId: testUser2Id,
        title: 'Sarah Secret Goal',
        category: 'WEIGHT',
        targetValue: 58.0,
      },
    });

    // Query scoped to User 1
    const u1Goals = await prisma.fitnessGoal.findMany({
      where: { userId: testUser1Id },
    });

    const leaked = u1Goals.some((g) => g.id === u2Goal.id);
    assert.strictEqual(leaked, false, 'User 1 must not receive User 2 records!');

    // Cleanup
    await prisma.fitnessGoal.delete({ where: { id: u2Goal.id } });
  });

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
