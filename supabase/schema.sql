-- Pro Fit: Complete Supabase PostgreSQL Schema with RLS
-- Run this in the Supabase SQL Editor if connecting directly to Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Profiles
CREATE TABLE IF NOT EXISTS public."User" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    "avatarUrl" TEXT,
    role TEXT DEFAULT 'USER',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."UserProfile" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    age INTEGER DEFAULT 25,
    gender TEXT DEFAULT 'NOT_SPECIFIED',
    "heightCm" DOUBLE PRECISION DEFAULT 175.0,
    "currentWeightKg" DOUBLE PRECISION DEFAULT 70.0,
    "targetWeightKg" DOUBLE PRECISION DEFAULT 68.0,
    "activityLevel" TEXT DEFAULT 'MODERATE',
    "fitnessGoal" TEXT DEFAULT 'BUILD_MUSCLE',
    "dailyCalorieTarget" INTEGER DEFAULT 2200,
    "dailyWaterTargetMl" INTEGER DEFAULT 3000,
    "dailyProteinTargetG" DOUBLE PRECISION DEFAULT 140.0,
    "dailyCarbTargetG" DOUBLE PRECISION DEFAULT 250.0,
    "dailyFatTargetG" DOUBLE PRECISION DEFAULT 65.0,
    bio TEXT DEFAULT 'Fitness enthusiast striving for daily progress.',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."PersonalSettings" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark',
    units TEXT DEFAULT 'METRIC',
    "soundEnabled" BOOLEAN DEFAULT true,
    "vibrationEnabled" BOOLEAN DEFAULT true,
    "restTimerDefaultSecs" INTEGER DEFAULT 90,
    "weeklyStartDay" INTEGER DEFAULT 1,
    "privacyMode" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Exercises (System & Custom)
CREATE TABLE IF NOT EXISTS public."Exercise" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT REFERENCES public."User"(id) ON DELETE CASCADE,
    "isSystem" BOOLEAN DEFAULT false,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'STRENGTH',
    "targetMuscle" TEXT DEFAULT 'CHEST',
    "secondaryMuscle" TEXT,
    equipment TEXT DEFAULT 'BARBELL',
    difficulty TEXT DEFAULT 'INTERMEDIATE',
    instructions TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Workout Sessions
CREATE TABLE IF NOT EXISTS public."WorkoutSession" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    "planId" TEXT,
    title TEXT NOT NULL,
    notes TEXT,
    "startedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "durationMinutes" INTEGER DEFAULT 0,
    "totalVolumeKg" DOUBLE PRECISION DEFAULT 0.0,
    "caloriesBurned" INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 5,
    status TEXT DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."WorkoutExercise" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "workoutSessionId" TEXT NOT NULL REFERENCES public."WorkoutSession"(id) ON DELETE CASCADE,
    "exerciseId" TEXT NOT NULL REFERENCES public."Exercise"(id) ON DELETE CASCADE,
    "orderIndex" INTEGER DEFAULT 0,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."WorkoutSet" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "workoutExerciseId" TEXT NOT NULL REFERENCES public."WorkoutExercise"(id) ON DELETE CASCADE,
    "setNumber" INTEGER DEFAULT 1,
    "setType" TEXT DEFAULT 'NORMAL',
    reps INTEGER DEFAULT 10,
    "weightKg" DOUBLE PRECISION DEFAULT 0.0,
    rpe DOUBLE PRECISION DEFAULT 8.0,
    "isCompleted" BOOLEAN DEFAULT true,
    "restTimeSeconds" INTEGER DEFAULT 60,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Workout Plans
CREATE TABLE IF NOT EXISTS public."WorkoutPlan" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    difficulty TEXT DEFAULT 'INTERMEDIATE',
    "daysPerWeek" INTEGER DEFAULT 4,
    "isPublic" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."WorkoutPlanRoutine" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "workoutPlanId" TEXT NOT NULL REFERENCES public."WorkoutPlan"(id) ON DELETE CASCADE,
    "dayOfWeek" INTEGER DEFAULT 1,
    name TEXT NOT NULL,
    "targetMuscles" TEXT,
    "exerciseList" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Nutrition
CREATE TABLE IF NOT EXISTS public."NutritionLog" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    "mealType" TEXT DEFAULT 'BREAKFAST',
    "foodName" TEXT NOT NULL,
    calories INTEGER DEFAULT 0,
    "proteinG" DOUBLE PRECISION DEFAULT 0.0,
    "carbsG" DOUBLE PRECISION DEFAULT 0.0,
    "fatG" DOUBLE PRECISION DEFAULT 0.0,
    "fiberG" DOUBLE PRECISION DEFAULT 0.0,
    "servingSize" DOUBLE PRECISION DEFAULT 100.0,
    "servingUnit" TEXT DEFAULT 'g',
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."FavoriteFood" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT,
    "defaultServing" DOUBLE PRECISION DEFAULT 100.0,
    "servingUnit" TEXT DEFAULT 'g',
    calories INTEGER DEFAULT 0,
    "proteinG" DOUBLE PRECISION DEFAULT 0.0,
    "carbsG" DOUBLE PRECISION DEFAULT 0.0,
    "fatG" DOUBLE PRECISION DEFAULT 0.0,
    "fiberG" DOUBLE PRECISION DEFAULT 0.0,
    "isFavorite" BOOLEAN DEFAULT true,
    "lastUsedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Hydration
CREATE TABLE IF NOT EXISTS public."WaterLog" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    "amountMl" INTEGER DEFAULT 250,
    notes TEXT,
    "loggedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."HydrationTarget" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    "dailyTargetMl" INTEGER DEFAULT 3000,
    "reminderIntervalMins" INTEGER DEFAULT 60,
    "autoAdjustForActivity" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Body Measurements
CREATE TABLE IF NOT EXISTS public."BodyMeasurement" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "bodyFatPercentage" DOUBLE PRECISION,
    "chestCm" DOUBLE PRECISION,
    "waistCm" DOUBLE PRECISION,
    "hipsCm" DOUBLE PRECISION,
    "bicepsCm" DOUBLE PRECISION,
    "thighsCm" DOUBLE PRECISION,
    notes TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Fitness Goals
CREATE TABLE IF NOT EXISTS public."FitnessGoal" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'WEIGHT',
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION DEFAULT 0.0,
    unit TEXT DEFAULT 'kg',
    "targetDate" TEXT,
    "isCompleted" BOOLEAN DEFAULT false,
    "progressPercent" DOUBLE PRECISION DEFAULT 0.0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Workout Schedules
CREATE TABLE IF NOT EXISTS public."WorkoutSchedule" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    "workoutPlanId" TEXT REFERENCES public."WorkoutPlan"(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    "scheduledDate" TEXT NOT NULL,
    "scheduledTime" TEXT,
    status TEXT DEFAULT 'SCHEDULED',
    "reminderMinutes" INTEGER DEFAULT 30,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Notifications
CREATE TABLE IF NOT EXISTS public."Notification" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'WORKOUT_REMINDER',
    "isRead" BOOLEAN DEFAULT false,
    "readAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public."NotificationPreference" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    "workoutReminders" BOOLEAN DEFAULT true,
    "hydrationReminders" BOOLEAN DEFAULT true,
    "goalMilestones" BOOLEAN DEFAULT true,
    "weeklyReports" BOOLEAN DEFAULT true,
    "emailNotifications" BOOLEAN DEFAULT false,
    "pushNotifications" BOOLEAN DEFAULT true,
    "reminderTime" TEXT DEFAULT '08:00',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Achievements
CREATE TABLE IF NOT EXISTS public."Achievement" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT REFERENCES public."User"(id) ON DELETE CASCADE,
    "isSystem" BOOLEAN DEFAULT false,
    key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT 'Trophy',
    "badgeColor" TEXT DEFAULT 'amber',
    "criteriaType" TEXT DEFAULT 'WORKOUT_COUNT',
    "criteriaValue" DOUBLE PRECISION DEFAULT 1.0,
    points INTEGER DEFAULT 50,
    "unlockedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Personal Records
CREATE TABLE IF NOT EXISTS public."PersonalRecord" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    "exerciseId" TEXT NOT NULL REFERENCES public."Exercise"(id) ON DELETE CASCADE,
    "workoutSessionId" TEXT REFERENCES public."WorkoutSession"(id) ON DELETE SET NULL,
    "recordType" TEXT DEFAULT 'MAX_WEIGHT',
    value DOUBLE PRECISION DEFAULT 0.0,
    unit TEXT DEFAULT 'kg',
    "achievedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. User Integrations
CREATE TABLE IF NOT EXISTS public."UserIntegration" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    "isConnected" BOOLEAN DEFAULT false,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "syncFrequency" TEXT DEFAULT 'HOURLY',
    "lastSyncedAt" TIMESTAMP WITH TIME ZONE,
    "configJson" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "UserIntegration_userId_provider_unique" UNIQUE ("userId", provider)
);
