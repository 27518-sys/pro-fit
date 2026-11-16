'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Sliders,
  Database,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Power,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SettingsPage() {
  const { currentUserId, currentUserName, fetchWithAuth, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'integrations' | 'supabase'>('profile');
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, sRes, iRes] = await Promise.all([
        fetchWithAuth('/api/profile'),
        fetchWithAuth('/api/settings'),
        fetchWithAuth('/api/integrations'),
      ]);
      const pJson = await pRes.json();
      const sJson = await sRes.json();
      const iJson = await iRes.json();

      if (pJson.success) setProfile(pJson.data);
      if (sJson.success) setSettings(sJson.data);
      if (iJson.success) setIntegrations(iJson.data);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const testSupabase = async () => {
    try {
      setTestingSupabase(true);
      const res = await fetchWithAuth('/api/supabase/test');
      const json = await res.json();
      setSupabaseStatus(json.data);
      if (json.data?.connected) {
        showToast('Supabase PostgreSQL connected successfully!', 'success');
      } else {
        showToast(json.data?.message || 'Supabase not connected', 'info');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setTestingSupabase(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Profile updated permanently!', 'success');
        setProfile(json.data);
      } else {
        showToast(json.error, 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Personal settings saved!', 'success');
        setSettings(json.data);
      } else {
        showToast(json.error, 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const toggleIntegration = async (provider: string, isConnected: boolean) => {
    try {
      const res = await fetchWithAuth('/api/integrations', {
        method: 'POST',
        body: JSON.stringify({
          provider,
          isConnected: !isConnected,
          syncFrequency: 'HOURLY',
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`${provider.replace('_', ' ')} ${!isConnected ? 'connected' : 'disconnected'}!`, 'success');
        loadData();
      } else {
        showToast(json.error, 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const providers = ['APPLE_HEALTH', 'GOOGLE_FIT', 'STRAVA', 'FITBIT', 'MYFITNESSPAL'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-emerald-400" />
          Settings & Connected Services
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          User profile, preferences, wearable integrations, and Supabase database config.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'profile'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Profile & Targets
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'preferences'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          App Preferences
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'integrations'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          Integrations & Devices
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'supabase'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Supabase & Database
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && profile && (
        <form onSubmit={saveProfile} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 max-w-2xl">
          <h3 className="text-base font-bold text-white">Personal Profile & Daily Calorie/Macro Targets</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
              <input
                type="number"
                value={profile.age || ''}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
              <select
                value={profile.gender || 'MALE'}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="NOT_SPECIFIED">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
              <input
                type="number"
                step="0.5"
                value={profile.heightCm || ''}
                onChange={(e) => setProfile({ ...profile, heightCm: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={profile.currentWeightKg || ''}
                onChange={(e) => setProfile({ ...profile, currentWeightKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Goal Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={profile.targetWeightKg || ''}
                onChange={(e) => setProfile({ ...profile, targetWeightKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fitness Goal</label>
              <select
                value={profile.fitnessGoal || 'BUILD_MUSCLE'}
                onChange={(e) => setProfile({ ...profile, fitnessGoal: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              >
                <option value="BUILD_MUSCLE">BUILD_MUSCLE</option>
                <option value="LOSE_WEIGHT">LOSE_WEIGHT</option>
                <option value="MAINTAIN">MAINTAIN</option>
                <option value="ENDURANCE">ENDURANCE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Level</label>
              <select
                value={profile.activityLevel || 'MODERATE'}
                onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              >
                <option value="SEDENTARY">Sedentary</option>
                <option value="LIGHT">Lightly Active</option>
                <option value="MODERATE">Moderately Active</option>
                <option value="VERY_ACTIVE">Very Active</option>
                <option value="EXTRA_ACTIVE">Extra Active</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">Daily Nutritional Targets</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  value={profile.dailyCalorieTarget || ''}
                  onChange={(e) => setProfile({ ...profile, dailyCalorieTarget: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={profile.dailyProteinTargetG || ''}
                  onChange={(e) => setProfile({ ...profile, dailyProteinTargetG: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={profile.dailyCarbTargetG || ''}
                  onChange={(e) => setProfile({ ...profile, dailyCarbTargetG: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={profile.dailyFatTargetG || ''}
                  onChange={(e) => setProfile({ ...profile, dailyFatTargetG: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Training Manifesto</label>
            <textarea
              rows={2}
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
          >
            Save Profile Changes
          </button>
        </form>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && settings && (
        <form onSubmit={saveSettings} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 max-w-xl">
          <h3 className="text-base font-bold text-white">App Experience & Timer Configurations</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Measurement Units</label>
              <select
                value={settings.units || 'METRIC'}
                onChange={(e) => setSettings({ ...settings, units: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              >
                <option value="METRIC">Metric (kg, cm, ml)</option>
                <option value="IMPERIAL">Imperial (lbs, in, oz)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Default Rest Timer (seconds)</label>
              <input
                type="number"
                min="10"
                max="600"
                value={settings.restTimerDefaultSecs || 90}
                onChange={(e) => setSettings({ ...settings, restTimerDefaultSecs: parseInt(e.target.value) || 90 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 text-xs text-slate-300 cursor-pointer">
              <span>Workout Sound Effects</span>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                className="rounded bg-slate-900 border-slate-800 text-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 text-xs text-slate-300 cursor-pointer">
              <span>Haptic Vibration Prompts</span>
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={(e) => setSettings({ ...settings, vibrationEnabled: e.target.checked })}
                className="rounded bg-slate-900 border-slate-800 text-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 text-xs text-slate-300 cursor-pointer">
              <span>Privacy Mode (Hide Metrics in Public)</span>
              <input
                type="checkbox"
                checked={settings.privacyMode}
                onChange={(e) => setSettings({ ...settings, privacyMode: e.target.checked })}
                className="rounded bg-slate-900 border-slate-800 text-emerald-500"
              />
            </label>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
          >
            Save App Preferences
          </button>
        </form>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 max-w-2xl">
          <h3 className="text-base font-bold text-white">Fitness Devices & Wearable Integrations</h3>
          <p className="text-xs text-slate-400">
            Connect Pro Fit to external fitness platforms to synchronize workouts, heart rate, and steps.
          </p>

          <div className="space-y-3 pt-2">
            {providers.map((p) => {
              const integ = integrations.find((i) => i.provider === p);
              const isConnected = !!integ?.isConnected;

              return (
                <div
                  key={p}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{p.replace('_', ' ')}</h4>
                    <p className="text-[11px] text-slate-400">
                      {isConnected
                        ? `Connected • Synced ${integ?.lastSyncedAt ? new Date(integ.lastSyncedAt).toLocaleTimeString() : 'recently'}`
                        : 'Not connected'}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleIntegration(p, isConnected)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                      isConnected
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900/60'
                        : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Supabase Tab */}
      {activeTab === 'supabase' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Supabase PostgreSQL Connection
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pro Fit uses Prisma ORM with relational persistence and is preconfigured for Supabase PostgreSQL cloud syncing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Local Prisma Database:</span>
              <span className="font-bold text-emerald-400">Active & Seeded (dev.db)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Supabase SQL Schema:</span>
              <span className="font-mono text-slate-300 text-[11px]">supabase/schema.sql (Ready)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">PostgreSQL Schema:</span>
              <span className="font-mono text-slate-300 text-[11px]">prisma/schema.postgresql.prisma</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={testSupabase}
              disabled={testingSupabase}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingSupabase ? 'animate-spin' : ''}`} />
              Test Supabase Cloud Connection
            </button>
          </div>

          {supabaseStatus && (
            <div
              className={`p-4 rounded-xl border text-xs ${
                supabaseStatus.connected
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <p className="font-bold mb-1">
                {supabaseStatus.connected ? 'Status: Online' : 'Status: Local Mode Active'}
              </p>
              <p className="text-[11px] text-slate-400">{supabaseStatus.message}</p>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-2">
            <p className="font-bold text-slate-200">How to connect your live Supabase project:</p>
            <ol className="list-decimal pl-4 space-y-1 text-[11px]">
              <li>Create a new project at <a href="https://supabase.com" target="_blank" className="text-emerald-400 underline">supabase.com</a>.</li>
              <li>Go to <b>SQL Editor</b> in your Supabase dashboard and run <code className="text-emerald-300">supabase/schema.sql</code>.</li>
              <li>Copy your Supabase Connection string into <code className="text-emerald-300">.env</code> as <code className="text-emerald-300">DATABASE_URL</code>.</li>
              <li>Copy your Supabase Project URL and Anon Key into <code className="text-emerald-300">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-emerald-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
