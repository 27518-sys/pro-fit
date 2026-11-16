'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Dumbbell,
  Apple,
  Droplet,
  Target,
  Trophy,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const { currentUserId, fetchWithAuth, showToast } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        showToast(json.error || 'Failed to load dashboard data', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [currentUserId]);

  const quickAddWater = async (amount: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetchWithAuth('/api/water', {
        method: 'POST',
        body: JSON.stringify({ date: today, amountMl: amount, notes: 'Quick hydration add' }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Added ${amount}ml of water!`, 'success');
        loadDashboard();
      } else {
        showToast(json.error || 'Failed to log water', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  const { stats, nutrition, hydration, weeklyTrend, activeGoals, recentPRs, recentSessions } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Session
            </span>
            <span className="text-xs text-slate-400">{data?.user?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time PostgreSQL/Prisma metrics. Full CRUD operational on all records.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/workouts"
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Log Workout
          </Link>
          <Link
            href="/ai-studio"
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AI Coach
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Workouts</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats?.totalWorkouts || 0}
            </span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Volume</span>
            <Dumbbell className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats?.totalVolumeKg?.toLocaleString() || 0}
            </span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Calories</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats?.totalCaloriesBurned?.toLocaleString() || 0}
            </span>
            <span className="text-xs text-slate-500">kcal</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Hydration Today</span>
            <Droplet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {hydration?.currentMl || 0}
            </span>
            <span className="text-xs text-slate-500">/ {hydration?.targetMl || 3000} ml</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Chart & Today's Nutrition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Volume Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Training Volume (Past 7 Days)</h3>
              <p className="text-xs text-slate-400">Daily lifted tonnage across all completed sets</p>
            </div>
            <Link href="/workouts" className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1">
              View Workouts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString()} kg`, 'Volume']}
                />
                <Bar dataKey="volume" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nutrition & Hydration Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Today's Nutrition</h3>
              <p className="text-xs text-slate-400">{nutrition?.itemsCount || 0} meals logged today</p>
            </div>
            <Link href="/nutrition" className="text-xs font-medium text-emerald-400 hover:underline">
              Log Meal
            </Link>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Calories Consumed</span>
              <span className="text-white font-bold">
                {nutrition?.calories || 0} / {nutrition?.targetCalories || 2200} kcal
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round(((nutrition?.calories || 0) / (nutrition?.targetCalories || 2200)) * 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Protein</span>
              <span className="text-sm font-bold text-emerald-400">{nutrition?.protein || 0}g</span>
              <span className="text-[9px] text-slate-500 block">/ {nutrition?.targetProtein || 140}g</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Carbs</span>
              <span className="text-sm font-bold text-amber-400">{nutrition?.carbs || 0}g</span>
              <span className="text-[9px] text-slate-500 block">/ {nutrition?.targetCarbs || 250}g</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Fat</span>
              <span className="text-sm font-bold text-rose-400">{nutrition?.fat || 0}g</span>
              <span className="text-[9px] text-slate-500 block">/ {nutrition?.targetFat || 65}g</span>
            </div>
          </div>

          {/* Quick Water Bar */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Hydration ({hydration?.progressPercent || 0}%)</span>
              <span className="text-cyan-400 font-bold">{hydration?.currentMl || 0} ml</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all"
                style={{ width: `${hydration?.progressPercent || 0}%` }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => quickAddWater(250)}
                className="flex-1 py-1 text-xs rounded-md bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/50 transition"
              >
                +250ml
              </button>
              <button
                onClick={() => quickAddWater(500)}
                className="flex-1 py-1 text-xs rounded-md bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/50 transition"
              >
                +500ml
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Grid: Active Goals & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Fitness Goals */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">Active Fitness Goals</h3>
            </div>
            <Link href="/goals" className="text-xs font-medium text-emerald-400 hover:underline">
              Manage Goals
            </Link>
          </div>

          <div className="space-y-3">
            {activeGoals && activeGoals.length > 0 ? (
              activeGoals.map((g: any) => (
                <div key={g.id} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <div className="flex justify-between items-start text-xs font-semibold text-slate-200">
                    <span>{g.title}</span>
                    <span className="text-emerald-400">{g.progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden my-2">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${g.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>
                      {g.currentValue} / {g.targetValue} {g.unit}
                    </span>
                    <span>{g.targetDate ? `Due: ${g.targetDate}` : 'Ongoing'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No active goals yet. <Link href="/goals" className="text-emerald-400 underline">Create one now</Link>!
              </div>
            )}
          </div>
        </div>

        {/* Recent PRs & Recent Sessions */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-semibold text-white">Recent Personal Records</h3>
            </div>
            <Link href="/personal-records" className="text-xs font-medium text-emerald-400 hover:underline">
              All PRs
            </Link>
          </div>

          <div className="space-y-3">
            {recentPRs && recentPRs.length > 0 ? (
              recentPRs.map((pr: any) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{pr.exercise?.name}</p>
                    <p className="text-[11px] text-slate-500">{pr.recordType.replace('_', ' ')} • {new Date(pr.achievedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 font-bold text-sm border border-amber-500/30">
                    {pr.value} {pr.unit}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No personal records logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
