const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  // Clear tables in reverse dependency order
  await prisma.workoutSet.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.workoutPlanRoutine.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.workoutSchedule.deleteMany();
  await prisma.personalRecord.deleteMany();
  await prisma.favoriteFood.deleteMany();
  await prisma.nutritionLog.deleteMany();
  await prisma.waterLog.deleteMany();
  await prisma.hydrationTarget.deleteMany();
  await prisma.bodyMeasurement.deleteMany();
  await prisma.fitnessGoal.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.userIntegration.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.personalSettings.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');
  const user1 = await prisma.user.create({
    data: {
      id: 'demo-user-1',
      email: 'alex@profit.io',
      name: 'Alex Mercer',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      role: 'USER',
      profile: {
        create: {
          age: 28,
          gender: 'MALE',
          heightCm: 180.0,
          currentWeightKg: 78.5,
          targetWeightKg: 75.0,
          activityLevel: 'VERY_ACTIVE',
          fitnessGoal: 'BUILD_MUSCLE',
          dailyCalorieTarget: 2500,
          dailyWaterTargetMl: 3500,
          dailyProteinTargetG: 165.0,
          dailyCarbTargetG: 280.0,
          dailyFatTargetG: 70.0,
          bio: 'Training for my first hybrid athlete competition.',
        },
      },
      settings: {
        create: {
          theme: 'dark',
          units: 'METRIC',
          soundEnabled: true,
          vibrationEnabled: true,
          restTimerDefaultSecs: 90,
          weeklyStartDay: 1,
          privacyMode: false,
        },
      },
      hydrationTarget: {
        create: {
          dailyTargetMl: 3500,
          reminderIntervalMins: 60,
          autoAdjustForActivity: true,
        },
      },
      notificationPreference: {
        create: {
          workoutReminders: true,
          hydrationReminders: true,
          goalMilestones: true,
          weeklyReports: true,
          emailNotifications: false,
          pushNotifications: true,
          reminderTime: '07:30',
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'demo-user-2',
      email: 'sarah@profit.io',
      name: 'Sarah Connor',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
      role: 'USER',
      profile: {
        create: {
          age: 26,
          gender: 'FEMALE',
          heightCm: 168.0,
          currentWeightKg: 62.0,
          targetWeightKg: 59.0,
          activityLevel: 'MODERATE',
          fitnessGoal: 'LOSE_WEIGHT',
          dailyCalorieTarget: 1900,
          dailyWaterTargetMl: 2800,
          dailyProteinTargetG: 130.0,
          dailyCarbTargetG: 190.0,
          dailyFatTargetG: 50.0,
          bio: 'Consistency over perfection.',
        },
      },
      settings: {
        create: {
          theme: 'dark',
          units: 'METRIC',
          soundEnabled: true,
          vibrationEnabled: true,
          restTimerDefaultSecs: 60,
          weeklyStartDay: 1,
          privacyMode: false,
        },
      },
      hydrationTarget: {
        create: {
          dailyTargetMl: 2800,
          reminderIntervalMins: 90,
          autoAdjustForActivity: false,
        },
      },
      notificationPreference: {
        create: {
          workoutReminders: true,
          hydrationReminders: true,
          goalMilestones: true,
          weeklyReports: true,
          emailNotifications: true,
          pushNotifications: true,
          reminderTime: '08:00',
        },
      },
    },
  });

  console.log('Seeding System Exercises...');
  const systemExercises = [
    {
      id: 'sys-ex-1',
      isSystem: true,
      name: 'Barbell Bench Press',
      category: 'STRENGTH',
      targetMuscle: 'CHEST',
      secondaryMuscle: 'TRICEPS',
      equipment: 'BARBELL',
      difficulty: 'INTERMEDIATE',
      description: 'The barbell bench press is a classic upper-body exercise that targets the pectorals, deltoids, and triceps.',
      instructions: 'Lie on the bench, grip the barbell slightly wider than shoulder width. Lower bar to mid-chest and press up explosively.',
    },
    {
      id: 'sys-ex-2',
      isSystem: true,
      name: 'Barbell Back Squat',
      category: 'STRENGTH',
      targetMuscle: 'LEGS',
      secondaryMuscle: 'CORE',
      equipment: 'BARBELL',
      difficulty: 'ADVANCED',
      description: 'The king of lower body exercises, developing quadriceps, hamstrings, and glutes.',
      instructions: 'Rest bar on upper traps. Descend until hips are below knee level, maintaining braced core, then drive upward.',
    },
    {
      id: 'sys-ex-3',
      isSystem: true,
      name: 'Conventional Deadlift',
      category: 'STRENGTH',
      targetMuscle: 'BACK',
      secondaryMuscle: 'LEGS',
      equipment: 'BARBELL',
      difficulty: 'ADVANCED',
      description: 'Full-body posterior chain powerhouse building back, glute, and grip strength.',
      instructions: 'Hinge hips, grasp bar, keep spine neutral, push floor away through mid-foot.',
    },
    {
      id: 'sys-ex-4',
      isSystem: true,
      name: 'Overhead Shoulder Press',
      category: 'STRENGTH',
      targetMuscle: 'SHOULDERS',
      secondaryMuscle: 'TRICEPS',
      equipment: 'BARBELL',
      difficulty: 'INTERMEDIATE',
      description: 'Compound shoulder exercise performed standing or seated.',
      instructions: 'Press bar upward from clavicle until arms are locked overhead.',
    },
    {
      id: 'sys-ex-5',
      isSystem: true,
      name: 'Pull-Up',
      category: 'BODYWEIGHT',
      targetMuscle: 'BACK',
      secondaryMuscle: 'ARMS',
      equipment: 'BODYWEIGHT',
      difficulty: 'INTERMEDIATE',
      description: 'Vertical pulling movement developing the latissimus dorsi and biceps.',
      instructions: 'Hang from pull-up bar, pull chest to bar with elbows driving down.',
    },
    {
      id: 'sys-ex-6',
      isSystem: true,
      name: 'Incline Dumbbell Press',
      category: 'STRENGTH',
      targetMuscle: 'CHEST',
      secondaryMuscle: 'SHOULDERS',
      equipment: 'DUMBBELL',
      difficulty: 'INTERMEDIATE',
      description: 'Upper pectoral focus utilizing 30-degree incline bench.',
      instructions: 'Press dumbbells up in an arcing motion, squeezing chest at peak.',
    },
  ];

  for (const ex of systemExercises) {
    await prisma.exercise.create({ data: ex });
  }

  console.log('Seeding Custom Exercises for User 1...');
  const customEx1 = await prisma.exercise.create({
    data: {
      userId: user1.id,
      isSystem: false,
      name: 'Cable Bayesian Curl',
      category: 'STRENGTH',
      targetMuscle: 'ARMS',
      secondaryMuscle: 'FOREARMS',
      equipment: 'CABLE',
      difficulty: 'INTERMEDIATE',
      description: 'Biceps curl with cables positioned behind the torso for maximum stretch at the bottom.',
      instructions: 'Face away from low pulley cable machine, curl handle forward while keeping elbow stationary.',
    },
  });

  const customEx2 = await prisma.exercise.create({
    data: {
      userId: user1.id,
      isSystem: false,
      name: 'Bulgarian Split Squat with Pause',
      category: 'STRENGTH',
      targetMuscle: 'LEGS',
      secondaryMuscle: 'CORE',
      equipment: 'DUMBBELL',
      difficulty: 'ADVANCED',
      description: 'Single-leg squat with rear foot elevated and 2-second pause at bottom.',
      instructions: 'Rear foot on bench, lower front thigh until parallel to ground, hold 2s, drive up.',
    },
  });

  console.log('Seeding Workout Plans & Routines...');
  const plan1 = await prisma.workoutPlan.create({
    data: {
      userId: user1.id,
      name: 'Push Pull Legs Hypertrophy',
      description: '6-day high-intensity hypertrophy split focused on progressive overload and aesthetic proportions.',
      difficulty: 'ADVANCED',
      daysPerWeek: 6,
      isPublic: true,
      routines: {
        create: [
          {
            dayOfWeek: 1,
            name: 'Push Day A (Chest & Triceps Focus)',
            targetMuscles: 'Chest, Front Delts, Triceps',
            exerciseList: JSON.stringify(['sys-ex-1', 'sys-ex-6', 'sys-ex-4']),
          },
          {
            dayOfWeek: 2,
            name: 'Pull Day A (Back & Biceps Focus)',
            targetMuscles: 'Lats, Rhomboids, Biceps',
            exerciseList: JSON.stringify(['sys-ex-3', 'sys-ex-5', customEx1.id]),
          },
          {
            dayOfWeek: 3,
            name: 'Legs Day A (Quad & Glute Focus)',
            targetMuscles: 'Quads, Hamstrings, Calves',
            exerciseList: JSON.stringify(['sys-ex-2', customEx2.id]),
          },
        ],
      },
    },
  });

  console.log('Seeding Workout Sessions...');
  const session1 = await prisma.workoutSession.create({
    data: {
      userId: user1.id,
      planId: plan1.id,
      title: 'Heavy Push Day - Chest Focus',
      notes: 'Felt very energetic today. Reached new PR on Bench Press set 3!',
      startedAt: new Date(Date.now() - 3600 * 1000 * 2),
      completedAt: new Date(Date.now() - 3600 * 1000 * 1),
      durationMinutes: 62,
      totalVolumeKg: 7850.0,
      caloriesBurned: 480,
      rating: 5,
      status: 'COMPLETED',
      exercises: {
        create: [
          {
            exerciseId: 'sys-ex-1', // Bench Press
            orderIndex: 0,
            notes: 'Felt very smooth, warm up properly',
            sets: {
              create: [
                { setNumber: 1, setType: 'WARMUP', reps: 12, weightKg: 60.0, rpe: 6.0, isCompleted: true },
                { setNumber: 2, setType: 'NORMAL', reps: 8, weightKg: 90.0, rpe: 8.0, isCompleted: true },
                { setNumber: 3, setType: 'NORMAL', reps: 6, weightKg: 105.0, rpe: 9.5, isCompleted: true },
                { setNumber: 4, setType: 'DROPSET', reps: 10, weightKg: 80.0, rpe: 9.0, isCompleted: true },
              ],
            },
          },
          {
            exerciseId: 'sys-ex-6', // Incline DB Press
            orderIndex: 1,
            notes: 'Deep stretch at bottom',
            sets: {
              create: [
                { setNumber: 1, setType: 'NORMAL', reps: 10, weightKg: 32.0, rpe: 8.0, isCompleted: true },
                { setNumber: 2, setType: 'NORMAL', reps: 8, weightKg: 36.0, rpe: 9.0, isCompleted: true },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Seeding Personal Records (PRs)...');
  await prisma.personalRecord.create({
    data: {
      userId: user1.id,
      exerciseId: 'sys-ex-1',
      workoutSessionId: session1.id,
      recordType: 'MAX_WEIGHT',
      value: 105.0,
      unit: 'kg',
      notes: 'New 6-rep max on barbell flat bench press!',
    },
  });

  await prisma.personalRecord.create({
    data: {
      userId: user1.id,
      exerciseId: 'sys-ex-2',
      recordType: 'MAX_WEIGHT',
      value: 150.0,
      unit: 'kg',
      notes: 'Clean full-depth squat single.',
    },
  });

  console.log('Seeding Nutrition Logs...');
  const today = new Date().toISOString().split('T')[0];
  await prisma.nutritionLog.createMany({
    data: [
      {
        userId: user1.id,
        date: today,
        mealType: 'BREAKFAST',
        foodName: 'Oatmeal with Whey Protein & Berries',
        calories: 520,
        proteinG: 42.0,
        carbsG: 68.0,
        fatG: 9.0,
        fiberG: 8.0,
        servingSize: 1,
        servingUnit: 'bowl',
        notes: 'Pre-workout fuel with rolled oats and blueberry blend',
      },
      {
        userId: user1.id,
        date: today,
        mealType: 'LUNCH',
        foodName: 'Grilled Chicken Breast with Jasmine Rice & Broccoli',
        calories: 680,
        proteinG: 58.0,
        carbsG: 75.0,
        fatG: 12.0,
        fiberG: 6.0,
        servingSize: 450,
        servingUnit: 'g',
        notes: 'Clean post-workout recovery meal',
      },
      {
        userId: user1.id,
        date: today,
        mealType: 'SNACK',
        foodName: 'Greek Yogurt 0% with Almonds & Honey',
        calories: 310,
        proteinG: 25.0,
        carbsG: 24.0,
        fatG: 11.0,
        fiberG: 3.0,
        servingSize: 200,
        servingUnit: 'g',
      },
    ],
  });

  console.log('Seeding Favorite Foods...');
  await prisma.favoriteFood.createMany({
    data: [
      {
        userId: user1.id,
        name: 'Whey Protein Isolate',
        brand: 'Optimum Nutrition',
        defaultServing: 30,
        servingUnit: 'g',
        calories: 120,
        proteinG: 24.0,
        carbsG: 2.0,
        fatG: 1.0,
        fiberG: 0.0,
        isFavorite: true,
      },
      {
        userId: user1.id,
        name: 'Boneless Skinless Chicken Breast',
        brand: 'Fresh Farm',
        defaultServing: 150,
        servingUnit: 'g',
        calories: 240,
        proteinG: 46.0,
        carbsG: 0.0,
        fatG: 5.0,
        fiberG: 0.0,
        isFavorite: true,
      },
    ],
  });

  console.log('Seeding Water Logs...');
  await prisma.waterLog.createMany({
    data: [
      { userId: user1.id, date: today, amountMl: 500, notes: 'Morning wake-up hydration' },
      { userId: user1.id, date: today, amountMl: 750, notes: 'During morning workout' },
      { userId: user1.id, date: today, amountMl: 500, notes: 'Post lunch glass' },
    ],
  });

  console.log('Seeding Body Measurements...');
  await prisma.bodyMeasurement.createMany({
    data: [
      {
        userId: user1.id,
        date: '2026-11-01',
        weightKg: 80.2,
        bodyFatPercentage: 16.5,
        chestCm: 104.0,
        waistCm: 84.5,
        hipsCm: 99.0,
        bicepsCm: 38.0,
        thighsCm: 60.5,
        notes: 'Starting baseline measurement for Q4 block',
      },
      {
        userId: user1.id,
        date: '2026-11-15',
        weightKg: 78.5,
        bodyFatPercentage: 15.2,
        chestCm: 105.0,
        waistCm: 82.0,
        hipsCm: 98.0,
        bicepsCm: 38.5,
        thighsCm: 61.0,
        notes: 'Waist down 2.5cm, chest and arms holding size well!',
      },
    ],
  });

  console.log('Seeding Fitness Goals...');
  await prisma.fitnessGoal.createMany({
    data: [
      {
        userId: user1.id,
        title: 'Reach 75 kg Target Bodyweight',
        description: 'Lean cut maintaining lean muscle mass with high protein intake',
        category: 'WEIGHT',
        targetValue: 75.0,
        currentValue: 78.5,
        unit: 'kg',
        targetDate: '2026-12-31',
        isCompleted: false,
        progressPercent: 65.0,
      },
      {
        userId: user1.id,
        title: 'Bench Press 120 kg Single',
        description: 'Targeting a 1.5x bodyweight 1RM bench press',
        category: 'STRENGTH',
        targetValue: 120.0,
        currentValue: 105.0,
        unit: 'kg',
        targetDate: '2026-12-25',
        isCompleted: false,
        progressPercent: 87.5,
      },
      {
        userId: user1.id,
        title: 'Log 20 Workouts This Month',
        description: 'Maintain 5 workouts per week consistency',
        category: 'HABIT',
        targetValue: 20.0,
        currentValue: 12.0,
        unit: 'sessions',
        targetDate: '2026-11-30',
        isCompleted: false,
        progressPercent: 60.0,
      },
    ],
  });

  console.log('Seeding Workout Schedules...');
  await prisma.workoutSchedule.createMany({
    data: [
      {
        userId: user1.id,
        workoutPlanId: plan1.id,
        title: 'Pull Day A (Back & Biceps)',
        description: 'Heavy Deadlifts followed by Pull-ups and Bayesian curls',
        scheduledDate: today,
        scheduledTime: '18:00',
        status: 'SCHEDULED',
        reminderMinutes: 30,
      },
      {
        userId: user1.id,
        workoutPlanId: plan1.id,
        title: 'Legs Day A (Squat Focus)',
        description: 'Back squats, Bulgarian split squats, and calf raises',
        scheduledDate: '2026-11-17',
        scheduledTime: '07:00',
        status: 'SCHEDULED',
        reminderMinutes: 45,
      },
    ],
  });

  console.log('Seeding Notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        title: 'Workout Scheduled for Today',
        message: 'Your Pull Day A session is scheduled for 18:00 today. Get ready to crush it!',
        type: 'WORKOUT_REMINDER',
        isRead: false,
      },
      {
        userId: user1.id,
        title: 'Hydration Target Check-in',
        message: "You've logged 1,750 ml of your 3,500 ml water target. Halfway there!",
        type: 'HYDRATION_REMINDER',
        isRead: false,
      },
      {
        userId: user1.id,
        title: 'New PR Achieved!',
        message: 'Congratulations on logging a new 105 kg Bench Press record!',
        type: 'PR_BROKEN',
        isRead: true,
        readAt: new Date(),
      },
    ],
  });

  console.log('Seeding Achievements (System & Custom)...');
  await prisma.achievement.createMany({
    data: [
      {
        id: 'ach-sys-1',
        isSystem: true,
        key: 'FIRST_WORKOUT',
        title: 'Iron Initiate',
        description: 'Completed your very first logged workout session.',
        icon: 'Flame',
        badgeColor: 'amber',
        criteriaType: 'WORKOUT_COUNT',
        criteriaValue: 1.0,
        points: 50,
        unlockedAt: new Date(),
      },
      {
        id: 'ach-sys-2',
        isSystem: true,
        key: 'VOLUME_10K',
        title: 'Tonnage Titan',
        description: 'Accumulated over 10,000 kg of total training volume.',
        icon: 'Award',
        badgeColor: 'emerald',
        criteriaType: 'VOLUME_KG',
        criteriaValue: 10000.0,
        points: 100,
        unlockedAt: null,
      },
      {
        id: 'ach-sys-3',
        isSystem: true,
        key: 'HYDRATION_MASTER',
        title: 'Hydration Hero',
        description: 'Hit your daily water target 7 days in a row.',
        icon: 'Droplets',
        badgeColor: 'blue',
        criteriaType: 'WATER_DAYS',
        criteriaValue: 7.0,
        points: 75,
        unlockedAt: null,
      },
      {
        id: 'ach-cust-1',
        userId: user1.id,
        isSystem: false,
        key: 'CUSTOM_CENTURY_BENCH',
        title: 'Century Club Crusher',
        description: 'Bench press three digits (100 kg+) for clean reps.',
        icon: 'ShieldCheck',
        badgeColor: 'purple',
        criteriaType: 'PR_COUNT',
        criteriaValue: 1.0,
        points: 150,
        unlockedAt: new Date(),
      },
    ],
  });

  console.log('Seeding User Integrations...');
  await prisma.userIntegration.createMany({
    data: [
      {
        userId: user1.id,
        provider: 'APPLE_HEALTH',
        isConnected: true,
        syncFrequency: 'REALTIME',
        lastSyncedAt: new Date(),
        configJson: JSON.stringify({ syncSteps: true, syncHeartRate: true, syncWorkouts: true }),
      },
      {
        userId: user1.id,
        provider: 'STRAVA',
        isConnected: false,
        syncFrequency: 'DAILY',
        configJson: JSON.stringify({ autoUpload: false }),
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
