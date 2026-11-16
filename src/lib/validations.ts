import { z } from 'zod';

// 1. Profile & Settings
export const userProfileSchema = z.object({
  age: z.coerce.number().int().min(10).max(120).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED']).optional(),
  heightCm: z.coerce.number().min(50).max(300).optional(),
  currentWeightKg: z.coerce.number().min(20).max(500).optional(),
  targetWeightKg: z.coerce.number().min(20).max(500).optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'VERY_ACTIVE', 'EXTRA_ACTIVE']).optional(),
  fitnessGoal: z.enum(['LOSE_WEIGHT', 'BUILD_MUSCLE', 'MAINTAIN', 'ENDURANCE']).optional(),
  dailyCalorieTarget: z.coerce.number().int().min(500).max(10000).optional(),
  dailyWaterTargetMl: z.coerce.number().int().min(500).max(15000).optional(),
  dailyProteinTargetG: z.coerce.number().min(0).max(1000).optional(),
  dailyCarbTargetG: z.coerce.number().min(0).max(1000).optional(),
  dailyFatTargetG: z.coerce.number().min(0).max(1000).optional(),
  bio: z.string().max(500).optional(),
});

export const personalSettingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).default('dark'),
  units: z.enum(['METRIC', 'IMPERIAL']).default('METRIC'),
  soundEnabled: z.boolean().default(true),
  vibrationEnabled: z.boolean().default(true),
  restTimerDefaultSecs: z.coerce.number().int().min(5).max(600).default(90),
  weeklyStartDay: z.coerce.number().int().min(0).max(6).default(1),
  privacyMode: z.boolean().default(false),
});

// 2. Exercise
export const exerciseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional().nullable(),
  category: z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'BODYWEIGHT']).default('STRENGTH'),
  targetMuscle: z.enum(['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'FULL_BODY']).default('CHEST'),
  secondaryMuscle: z.string().max(50).optional().nullable(),
  equipment: z.enum(['BARBELL', 'DUMBBELL', 'MACHINE', 'BODYWEIGHT', 'CABLE', 'BANDS', 'KETTLEBELL']).default('BARBELL'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
  instructions: z.string().max(2000).optional().nullable(),
  videoUrl: z.string().url().optional().nullable().or(z.literal('')),
});

// 3 & 4. Workout Session, Exercises, Sets
export const workoutSetSchema = z.object({
  id: z.string().optional(),
  setNumber: z.coerce.number().int().min(1).default(1),
  setType: z.enum(['WARMUP', 'NORMAL', 'DROPSET', 'FAILURE']).default('NORMAL'),
  reps: z.coerce.number().int().min(0).max(1000).default(10),
  weightKg: z.coerce.number().min(0).max(2000).default(0),
  rpe: z.coerce.number().min(1).max(10).optional().nullable(),
  isCompleted: z.boolean().default(true),
  restTimeSeconds: z.coerce.number().int().min(0).max(600).default(60),
});

export const workoutExerciseSchema = z.object({
  id: z.string().optional(),
  exerciseId: z.string().min(1, 'Exercise selection is required'),
  orderIndex: z.coerce.number().int().default(0),
  notes: z.string().max(500).optional().nullable(),
  sets: z.array(workoutSetSchema).default([]),
});

export const workoutSessionSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  planId: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional().nullable(),
  durationMinutes: z.coerce.number().int().min(0).max(1440).default(45),
  totalVolumeKg: z.coerce.number().min(0).default(0),
  caloriesBurned: z.coerce.number().int().min(0).default(0),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('COMPLETED'),
  exercises: z.array(workoutExerciseSchema).default([]),
});

// 5. Workout Plan
export const workoutPlanRoutineSchema = z.object({
  id: z.string().optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6).default(1),
  name: z.string().min(2).max(100),
  targetMuscles: z.string().optional().nullable(),
  exerciseList: z.string().optional().nullable(),
});

export const workoutPlanSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional().nullable(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
  daysPerWeek: z.coerce.number().int().min(1).max(7).default(4),
  isPublic: z.boolean().default(false),
  routines: z.array(workoutPlanRoutineSchema).optional(),
});

// 6. Nutrition Log
export const nutritionLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']).default('BREAKFAST'),
  foodName: z.string().min(2, 'Food name is required').max(150),
  calories: z.coerce.number().int().min(0).max(10000),
  proteinG: z.coerce.number().min(0).max(1000).default(0),
  carbsG: z.coerce.number().min(0).max(1000).default(0),
  fatG: z.coerce.number().min(0).max(1000).default(0),
  fiberG: z.coerce.number().min(0).max(200).default(0),
  servingSize: z.coerce.number().min(0.1).default(100),
  servingUnit: z.string().default('g'),
  notes: z.string().max(500).optional().nullable(),
});

// 7. Favorite Food
export const favoriteFoodSchema = z.object({
  name: z.string().min(2, 'Food name is required').max(150),
  brand: z.string().max(100).optional().nullable(),
  defaultServing: z.coerce.number().min(0.1).default(100),
  servingUnit: z.string().default('g'),
  calories: z.coerce.number().int().min(0).max(10000),
  proteinG: z.coerce.number().min(0).default(0),
  carbsG: z.coerce.number().min(0).default(0),
  fatG: z.coerce.number().min(0).default(0),
  fiberG: z.coerce.number().min(0).default(0),
  isFavorite: z.boolean().default(true),
});

// 8. Water Log & Hydration Target
export const waterLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  amountMl: z.coerce.number().int().min(10, 'Amount must be at least 10ml').max(10000),
  notes: z.string().max(250).optional().nullable(),
});

export const hydrationTargetSchema = z.object({
  dailyTargetMl: z.coerce.number().int().min(500).max(15000),
  reminderIntervalMins: z.coerce.number().int().min(15).max(360).default(60),
  autoAdjustForActivity: z.boolean().default(true),
});

// 9. Body Measurement
export const bodyMeasurementSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  weightKg: z.coerce.number().min(20).max(500),
  bodyFatPercentage: z.coerce.number().min(1).max(70).optional().nullable(),
  chestCm: z.coerce.number().min(30).max(250).optional().nullable(),
  waistCm: z.coerce.number().min(30).max(250).optional().nullable(),
  hipsCm: z.coerce.number().min(30).max(250).optional().nullable(),
  bicepsCm: z.coerce.number().min(10).max(100).optional().nullable(),
  thighsCm: z.coerce.number().min(10).max(150).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  photoUrl: z.string().url().optional().nullable().or(z.literal('')),
});

// 10. Fitness Goal
export const fitnessGoalSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(['WEIGHT', 'STRENGTH', 'ENDURANCE', 'HABIT', 'NUTRITION']).default('WEIGHT'),
  targetValue: z.coerce.number(),
  currentValue: z.coerce.number().default(0),
  unit: z.string().min(1).max(20).default('kg'),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal('')),
  isCompleted: z.boolean().default(false),
  progressPercent: z.coerce.number().min(0).max(100).default(0),
});

// 11. Workout Schedule
export const workoutScheduleSchema = z.object({
  workoutPlanId: z.string().optional().nullable(),
  title: z.string().min(2, 'Schedule title is required').max(150),
  description: z.string().max(500).optional().nullable(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm').optional().nullable(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED']).default('SCHEDULED'),
  reminderMinutes: z.coerce.number().int().min(0).max(1440).default(30),
});

// 12. Notification & Preferences
export const notificationSchema = z.object({
  title: z.string().min(1).max(150),
  message: z.string().min(1).max(500),
  type: z.enum(['WORKOUT_REMINDER', 'HYDRATION_REMINDER', 'GOAL_ACHIEVED', 'PR_BROKEN', 'SYSTEM']).default('WORKOUT_REMINDER'),
  isRead: z.boolean().default(false),
});

export const notificationPreferenceSchema = z.object({
  workoutReminders: z.boolean().default(true),
  hydrationReminders: z.boolean().default(true),
  goalMilestones: z.boolean().default(true),
  weeklyReports: z.boolean().default(true),
  emailNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/).default('08:00'),
});

// 13. Achievement
export const achievementSchema = z.object({
  key: z.string().min(2).max(100),
  title: z.string().min(2).max(150),
  description: z.string().min(2).max(500),
  icon: z.string().default('Trophy'),
  badgeColor: z.string().default('amber'),
  criteriaType: z.enum(['WORKOUT_COUNT', 'VOLUME_KG', 'STREAK_DAYS', 'PR_COUNT', 'WATER_DAYS']).default('WORKOUT_COUNT'),
  criteriaValue: z.coerce.number().min(1).default(1),
  points: z.coerce.number().int().min(1).default(50),
});

// 14. Personal Record
export const personalRecordSchema = z.object({
  exerciseId: z.string().min(1, 'Exercise selection is required'),
  workoutSessionId: z.string().optional().nullable(),
  recordType: z.enum(['MAX_WEIGHT', 'MAX_REPS', 'MAX_VOLUME', 'BEST_TIME']).default('MAX_WEIGHT'),
  value: z.coerce.number().min(0.1, 'Value must be greater than 0'),
  unit: z.string().default('kg'),
  achievedAt: z.string().optional(),
  notes: z.string().max(500).optional().nullable(),
});

// 15. User Integration
export const userIntegrationSchema = z.object({
  provider: z.enum(['APPLE_HEALTH', 'GOOGLE_FIT', 'STRAVA', 'FITBIT', 'MYFITNESSPAL']),
  isConnected: z.boolean().default(false),
  syncFrequency: z.enum(['REALTIME', 'HOURLY', 'DAILY', 'MANUAL']).default('HOURLY'),
  configJson: z.string().optional().nullable(),
});
