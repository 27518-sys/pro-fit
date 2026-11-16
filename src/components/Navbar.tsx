'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dumbbell, Bell, Sparkles, User, Database, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function Navbar() {
  const { currentUserId, currentUserName, switchUser, fetchWithAuth } = useApp();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetchWithAuth('/api/notifications');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setUnreadCount(data.data.filter((n: any) => !n.isRead).length);
        }
      } catch (e) {
        // ignore
      }
    }
    loadNotifications();
  }, [currentUserId]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <Dumbbell className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                PRO <span className="text-emerald-400">FIT</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-400/80 block -mt-1">
                AI Fitness Studio
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Studio Shortcut */}
          <Link
            href="/ai-studio"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition glow-emerald"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Assistant
          </Link>

          {/* Supabase Status Pill */}
          <Link
            href="/settings"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:border-slate-700 transition"
          >
            <Database className="w-3 h-3 text-emerald-400" />
            Prisma & Supabase
          </Link>

          {/* Notifications link */}
          <Link
            href="/notifications"
            className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Active User Switcher to demonstrate Strict CRUD Authorization & Data Isolation */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-medium text-slate-200 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                {currentUserName.charAt(0)}
              </div>
              <span className="max-w-[110px] truncate text-xs sm:text-sm">{currentUserName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Active Session User
                </div>
                <button
                  onClick={() => {
                    switchUser('demo-user-1', 'Alex Mercer');
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/60 transition ${
                    currentUserId === 'demo-user-1' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <p>Alex Mercer</p>
                    <p className="text-[10px] text-slate-500">alex@profit.io</p>
                  </div>
                  {currentUserId === 'demo-user-1' && <span className="text-emerald-400">✓</span>}
                </button>
                <button
                  onClick={() => {
                    switchUser('demo-user-2', 'Sarah Connor');
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/60 transition ${
                    currentUserId === 'demo-user-2' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <p>Sarah Connor</p>
                    <p className="text-[10px] text-slate-500">sarah@profit.io</p>
                  </div>
                  {currentUserId === 'demo-user-2' && <span className="text-emerald-400">✓</span>}
                </button>
                <div className="border-t border-slate-800 mt-1 pt-1">
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    User Profile & Settings
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
