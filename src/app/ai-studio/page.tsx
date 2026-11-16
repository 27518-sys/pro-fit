'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Dumbbell,
  Apple,
  Bot,
  Send,
  Save,
  CheckCircle2,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AIStudioPage() {
  const { currentUserId, fetchWithAuth, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'workout' | 'meal' | 'coach'>('workout');

  // AI Workout Generator State
  const [workoutMuscle, setWorkoutMuscle] = useState('CHEST');
  const [workoutDifficulty, setWorkoutDifficulty] = useState('INTERMEDIATE');
  const [workoutDuration, setWorkoutDuration] = useState(45);
  const [generatingWorkout, setGeneratingWorkout] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);

  // AI Meal Planner State
  const [mealCalories, setMealCalories] = useState(2400);
  const [dietPref, setDietPref] = useState('HIGH_PROTEIN');
  const [generatingMeals, setGeneratingMeals] = useState(false);
  const [generatedMeals, setGeneratedMeals] = useState<any>(null);

  // AI Coach Chat State
  const [coachInput, setCoachInput] = useState('');
  const [coachMessages, setCoachMessages] = useState<any[]>([
    {
      role: 'assistant',
      text: 'Hello! I am your Pro Fit AI Coach. I have analyzed your recent workout volume, PR benchmarks, and nutrition targets. How can I optimize your training today?',
    },
  ]);
  const [sendingChat, setSendingChat] = useState(false);

  // Generate Workout
  const handleGenerateWorkout = async (saveAsPlan = false) => {
    try {
      setGeneratingWorkout(true);
      const res = await fetchWithAuth('/api/ai/workout-gen', {
        method: 'POST',
        body: JSON.stringify({
          targetMuscle: workoutMuscle,
          difficulty: workoutDifficulty,
          durationMinutes: workoutDuration,
          saveAsPlan,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedWorkout(json.data);
        showToast(saveAsPlan ? 'AI Workout generated and saved to your plans!' : 'AI Workout generated!', 'success');
      } else {
        showToast(json.error, 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setGeneratingWorkout(false);
    }
  };

  // Generate Meal Plan
  const handleGenerateMeals = async (logToNutrition = false) => {
    try {
      setGeneratingMeals(true);
      const res = await fetchWithAuth('/api/ai/meal-gen', {
        method: 'POST',
        body: JSON.stringify({
          calorieTarget: mealCalories,
          dietPreference: dietPref,
          logToNutrition,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedMeals(json.data);
        showToast(logToNutrition ? 'Meal plan generated and logged to today!' : 'AI Meal plan generated!', 'success');
      } else {
        showToast(json.error, 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setGeneratingMeals(false);
    }
  };

  // Send Chat to AI Coach
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachInput.trim() || sendingChat) return;

    const userText = coachInput;
    setCoachInput('');
    setCoachMessages((prev) => [...prev, { role: 'user', text: userText }]);

    try {
      setSendingChat(true);
      const res = await fetchWithAuth('/api/ai/coach', {
        method: 'POST',
        body: JSON.stringify({ message: userText }),
      });
      const json = await res.json();
      if (json.success) {
        setCoachMessages((prev) => [...prev, { role: 'assistant', text: json.data.reply }]);
      } else {
        showToast(json.error, 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Lovable AI Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            AI Fitness Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Intelligent workout generator, adaptive meal planner, and conversational fitness coach.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'workout'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          AI Workout Generator
        </button>
        <button
          onClick={() => setActiveTab('meal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'meal'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Apple className="w-3.5 h-3.5" />
          AI Meal Planner
        </button>
        <button
          onClick={() => setActiveTab('coach')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'coach'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          AI Fitness Coach
        </button>
      </div>

      {/* Workout Generator Tab */}
      {activeTab === 'workout' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Generation Parameters</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Muscle Group</label>
              <select
                value={workoutMuscle}
                onChange={(e) => setWorkoutMuscle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              >
                <option value="CHEST">CHEST</option>
                <option value="BACK">BACK</option>
                <option value="LEGS">LEGS</option>
                <option value="SHOULDERS">SHOULDERS</option>
                <option value="ARMS">ARMS</option>
                <option value="CORE">CORE</option>
                <option value="FULL_BODY">FULL BODY</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Intensity / Difficulty</label>
              <select
                value={workoutDifficulty}
                onChange={(e) => setWorkoutDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Duration (minutes)</label>
              <input
                type="number"
                min="15"
                max="120"
                value={workoutDuration}
                onChange={(e) => setWorkoutDuration(parseInt(e.target.value) || 45)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => handleGenerateWorkout(false)}
                disabled={generatingWorkout}
                className="w-full py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4" />
                {generatingWorkout ? 'Synthesizing Routine...' : 'Generate Workout'}
              </button>
              <button
                onClick={() => handleGenerateWorkout(true)}
                disabled={generatingWorkout}
                className="w-full py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                Generate & Save as Plan
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            {generatedWorkout ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-lg font-bold text-white">{generatedWorkout.title}</h3>
                    <p className="text-xs text-slate-400">
                      {generatedWorkout.estimatedMinutes} mins • ~{generatedWorkout.estimatedCaloriesBurned} kcal • {generatedWorkout.difficulty}
                    </p>
                  </div>
                  {generatedWorkout.savedPlan && (
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      ✓ Saved to Database
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {generatedWorkout.exercises?.map((ex: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="flex justify-between items-center text-xs font-bold text-emerald-400 mb-2">
                        <span>{idx + 1}. {ex.name}</span>
                        <span className="text-slate-400 uppercase text-[10px]">{ex.targetMuscle} • {ex.category}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {ex.sets?.map((s: any, sIdx: number) => (
                          <div key={sIdx} className="p-2 rounded-lg bg-slate-900 text-center text-xs">
                            <span className="text-[10px] text-slate-500 block">Set {s.setNumber}</span>
                            <span className="font-bold text-white">{s.weightKg}kg × {s.reps}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 text-xs">
                <Dumbbell className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                Configure parameters and click 'Generate Workout' to construct your custom training program.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meal Planner Tab */}
      {activeTab === 'meal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Nutrition Targets</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Calorie Target</label>
              <input
                type="number"
                min="1000"
                max="6000"
                value={mealCalories}
                onChange={(e) => setMealCalories(parseInt(e.target.value) || 2200)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dietary Focus</label>
              <select
                value={dietPref}
                onChange={(e) => setDietPref(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              >
                <option value="HIGH_PROTEIN">HIGH_PROTEIN (Strength & Muscle)</option>
                <option value="BALANCED">BALANCED (General Health)</option>
                <option value="VEGETARIAN">VEGETARIAN (Plant-Based)</option>
                <option value="KETO">KETO (Low Carb)</option>
              </select>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => handleGenerateMeals(false)}
                disabled={generatingMeals}
                className="w-full py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4" />
                {generatingMeals ? 'Designing Menu...' : 'Generate Daily Plan'}
              </button>
              <button
                onClick={() => handleGenerateMeals(true)}
                disabled={generatingMeals}
                className="w-full py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                Generate & Log to Today
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            {generatedMeals ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">Daily Macro Balanced Plan</h3>
                    <p className="text-xs text-slate-400">
                      {generatedMeals.dailyTargetCalories} kcal • {generatedMeals.totalProtein}g Protein • {generatedMeals.totalCarbs}g Carbs • {generatedMeals.totalFat}g Fat
                    </p>
                  </div>
                  {generatedMeals.loggedCount > 0 && (
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      ✓ {generatedMeals.loggedCount} Meals Logged to DB
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {generatedMeals.meals?.map((m: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="flex justify-between items-center text-xs font-bold text-white mb-1">
                        <span className="text-emerald-400 uppercase tracking-wider">{m.mealType}</span>
                        <span>{m.calories} kcal</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{m.foodName}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {m.proteinG}g Protein • {m.carbsG}g Carbs • {m.fatG}g Fat ({m.servingSize}{m.servingUnit})
                      </p>
                      {m.notes && <p className="text-[10px] text-slate-500 italic mt-1">"{m.notes}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 text-xs">
                <Apple className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                Configure calories and dietary preferences to generate a macro-optimized daily meal plan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Coach Tab */}
      {activeTab === 'coach' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col h-[520px]">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Pro Fit AI Coach</h3>
                <p className="text-[10px] text-emerald-400 font-medium">Active Contextual Training Advisor</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400">Context: Profile, PRs, Nutrition & Volume</span>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {coachMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'),
                  }}
                />
              </div>
            ))}
            {sendingChat && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-slate-950 text-slate-400 text-xs border border-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  AI Coach is evaluating your metrics...
                </div>
              </div>
            )}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask about workout splits, progressive overload, recovery, or protein timing..."
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
            />
            <button
              type="submit"
              disabled={sendingChat || !coachInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
