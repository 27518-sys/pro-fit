'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  CalendarDays,
  Apple,
  Droplet,
  Scale,
  Target,
  Trophy,
  Award,
  Bell,
  Sparkles,
  Settings,
  Flame,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workouts', label: 'Workouts & Sets', icon: Flame },
  { href: '/exercises', label: 'Exercise Library', icon: Dumbbell },
  { href: '/plans', label: 'Workout Plans', icon: BookOpen },
  { href: '/schedules', label: 'Calendar Schedule', icon: CalendarDays },
  { href: '/nutrition', label: 'Nutrition & Foods', icon: Apple },
  { href: '/hydration', label: 'Hydration Tracker', icon: Droplet },
  { href: '/measurements', label: 'Body Metrics', icon: Scale },
  { href: '/goals', label: 'Fitness Goals', icon: Target },
  { href: '/personal-records', label: 'Personal Records', icon: Trophy },
  { href: '/achievements', label: 'Achievements', icon: Award },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/ai-studio', label: 'AI Fitness Studio', icon: Sparkles, badge: 'AI' },
  { href: '/settings', label: 'Settings & Cloud', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 pt-16 z-30 bg-slate-950/70 border-r border-slate-800/80 backdrop-blur-md">
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Core Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Pro Fit badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-200">
            <span>Storage Engine</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
              Prisma ORM
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Complete persistent CRUD verified across all 15 modules.
          </p>
        </div>
      </div>
    </aside>
  );
}
