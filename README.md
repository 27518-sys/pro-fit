# 🏋️‍♂️ Pro Fit — AI-Powered Fitness & Workout Suite

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **PostgreSQL / Supabase**, and **Zod**.

Designed with the **Lovable AI** modern dark aesthetic (emerald neon accents, glassmorphic cards, responsive sidebar, and interactive modal dialogs).

---

## ⚡ Mandatory Complete CRUD Operations Coverage

Every single module implements full, end-to-end CRUD (Create, Read, Update, Delete) with prefilled forms, server-side session authorization, database persistence, and cascading relationships:

1. **User Profiles and Personal Settings**:
   - Age, gender, height, current weight, target weight, activity level, fitness goals, and bio.
   - App preferences: Metric/Imperial units, default rest timer, sound, haptic vibration, and privacy mode.
2. **Custom Exercises and Exercise Library Management**:
   - Comprehensive exercise library filtered by target muscle, category, and equipment.
   - Predefined system exercises with **restricted management permissions** (protected from deletion or tampering by regular users).
   - Full CRUD for user-created custom movements.
3. **Workout Sessions**:
   - Title, duration, rating (1–5), calories burned, status (`COMPLETED`, `IN_PROGRESS`, `PLANNED`), notes, and lifted volume.
   - Full update, delete with confirmation dialog, and cascading to sets.
4. **Workout Exercises and Individual Workout Sets**:
   - Dynamic exercise set logger with weights (kg), reps, RPE, rest intervals, and set types (`NORMAL`, `WARMUP`, `DROPSET`, `FAILURE`).
5. **Workout Plans and Scheduled Workouts**:
   - Multi-day weekly periodization splits (e.g. Push Pull Legs, Upper/Lower).
   - Routine sub-days with muscle groups and exercise assignments.
6. **Food Records and Daily Nutrition Entries**:
   - Daily logs categorized by Breakfast, Lunch, Dinner, and Snack.
   - Exact calorie, protein, carbohydrate, fat, and fiber macro tracking.
7. **Favorite and Recently Used Foods**:
   - Pre-saved foods and brands with default serving sizes.
   - Single-click "+ Log to Today" action and complete CRUD management.
8. **Water Consumption Entries and Hydration Targets**:
   - Daily water intake logging with timestamps and quick-add shortcuts (+250ml, +500ml, +750ml, +1000ml).
   - Configurable hydration target, reminder intervals, and auto-adjustment for workout intensity.
9. **Body Weight and Anthropometric Measurements**:
   - Fasted weight, body fat %, waist, chest, hips, biceps, and thighs measurements.
   - Interactive weight trajectory chart (Recharts) and auto-sync with profile current weight.
10. **Fitness Goals and Goal Progress**:
    - Target goals across Weight, Strength, Endurance, and Habit categories.
    - Real-time progress percentage bar, inline value adjuster, and milestone completion toggles.
11. **Workout Schedules and Calendar Activities**:
    - Schedule workouts by date and time with reminder alerts.
    - Status management (`SCHEDULED`, `COMPLETED`, `MISSED`, `CANCELLED`).
12. **Notifications and Notification Preferences**:
    - Activity inbox, mark as read/unread, delete, and manual reminder creation.
    - Notification preferences for workout alerts, hydration check-ins, goal milestones, and weekly reports.
13. **Custom Achievements and System Badges**:
    - System trophies (Iron Initiate, Tonnage Titan, Hydration Hero) with protected permissions.
    - User-defined custom milestones with points, criteria types, and unlock states.
14. **Personal Records (PRs)**:
    - Benchmarks for max weight, max reps, and max volume per exercise.
    - Integrated Epley One-Rep Max (1RM) calculator.
15. **User Integrations and Preferences**:
    - Device connectivity for Apple Health, Strava, Google Fit, Fitbit, and MyFitnessPal.
    - Connection state, sync frequency (`REALTIME`, `HOURLY`, `DAILY`), and disconnect actions.

---

## 🤖 AI Fitness Studio (Lovable AI Engine)

- **AI Workout Generator**: Generates custom training routines tailored to muscle group, difficulty level, and available time. Save directly to database as a permanent Workout Plan or log as a completed session.
- **AI Daily Meal Planner**: Generates personalized macro-split meal plans for Breakfast, Lunch, Snack, and Dinner matching calorie targets and dietary preferences (`HIGH_PROTEIN`, `BALANCED`, `VEGETARIAN`, `KETO`). Log directly to database nutrition tracker with one click.
- **AI Fitness Coach**: Context-aware conversational AI coach analyzing user's current weight, active goals, PRs, and recent volume to provide actionable recommendations.

---

## 🔒 Strict CRUD Authorization & Data Isolation

- Verified server-side session derivation: Authenticated user is determined exclusively on the server (`getAuthUser`), never trusting client-provided user IDs.
- Cross-User Isolation: All queries and mutations are scoped to `authUser.id`. A user cannot read, update, or delete records belonging to another user.
- Built-in Active User Switcher in the top navigation bar to seamlessly test and demonstrate cross-user authorization between Alex Mercer and Sarah Connor!

---

## 🧪 Comprehensive Automated CRUD Test Suite

Run the full-stack test suite across all 15 modules:
\`\`\`bash
npm run test:crud
\`\`\`
**Result: 51 / 51 tests passed (100% success rate)** covering record creation, reading, updates, deletions, validation failures, cascade rules, system record protection, and cross-user data isolation.

---

## 🌐 Supabase PostgreSQL & GitHub Connection

### Supabase Connection
1. Run the provided SQL migration in the Supabase SQL Editor:
   - File: `supabase/schema.sql`
2. Add your connection strings to `.env`:
   \`\`\`env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
   \`\`\`
3. Push Prisma schema:
   \`\`\`bash
   npx prisma db push --schema=prisma/schema.postgresql.prisma
   \`\`\`

### GitHub Setup
Initialize repository and push to GitHub:
\`\`\`bash
git init
git add .
git commit -m "feat: complete Pro Fit full-stack fitness app with complete CRUD across all 15 modules and AI studio"
git branch -M main
git remote add origin https://github.com/<your-username>/pro-fit.git
git push -u origin main
\`\`\`

---

## 🚀 Running the Application

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Initialize and seed database:
   \`\`\`bash
   npx prisma db push
   npm run prisma:seed
   \`\`\`
3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000) in your browser.
