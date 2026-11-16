'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, CheckCircle2, Clock, Settings2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function NotificationsPage() {
  const { currentUserId, fetchWithAuth, showToast } = useApp();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'WORKOUT_REMINDER',
  });

  const [prefsData, setPrefsData] = useState({
    workoutReminders: true,
    hydrationReminders: true,
    goalMilestones: true,
    weeklyReports: true,
    emailNotifications: false,
    pushNotifications: true,
    reminderTime: '08:00',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [nRes, pRes] = await Promise.all([
        fetchWithAuth('/api/notifications'),
        fetchWithAuth('/api/notifications/preferences'),
      ]);
      const nJson = await nRes.json();
      const pJson = await pRes.json();

      if (nJson.success) setNotifications(nJson.data);
      if (pJson.success) {
        setPreferences(pJson.data);
        setPrefsData(pJson.data);
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const toggleRead = async (notif: any) => {
    try {
      const res = await fetchWithAuth(`/api/notifications/${notif.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isRead: !notif.isRead }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(notif.isRead ? 'Marked as unread' : 'Marked as read', 'info');
        loadData();
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Notification reminder created!', 'success');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast(json.error || 'Failed to create', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handlePrefsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(prefsData),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Notification preferences saved!', 'success');
        loadData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetchWithAuth(`/api/notifications/${deleteTargetId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Notification deleted.', 'info');
        setDeleteTargetId(null);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-emerald-400" />
            Notifications & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage alerts, delivery schedules, and create custom training reminders.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ title: 'Prep Gym Bag', message: 'Hydration bottle and straps packed', type: 'WORKOUT_REMINDER' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create Reminder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Feed */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Inbox & Activity Alerts</h3>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center italic">
              No notifications currently in your feed.
            </p>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition flex items-start justify-between gap-3 ${
                    n.isRead
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-75'
                      : 'bg-slate-950 border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleRead(n)}
                      className={`p-1 mt-0.5 rounded transition ${
                        n.isRead ? 'text-slate-500 hover:text-emerald-400' : 'text-emerald-400'
                      }`}
                      title={n.isRead ? 'Mark unread' : 'Mark read'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <p className={`text-xs font-bold ${n.isRead ? 'text-slate-300' : 'text-white'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(n.createdAt).toLocaleString()} • {n.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTargetId(n.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-900"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preferences Form */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Alert Preferences</h3>
          </div>

          <form onSubmit={handlePrefsSave} className="space-y-3 pt-2">
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-lg hover:bg-slate-950">
              <span>Workout Reminders</span>
              <input
                type="checkbox"
                checked={prefsData.workoutReminders}
                onChange={(e) => setPrefsData({ ...prefsData, workoutReminders: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-lg hover:bg-slate-950">
              <span>Hydration Reminders</span>
              <input
                type="checkbox"
                checked={prefsData.hydrationReminders}
                onChange={(e) => setPrefsData({ ...prefsData, hydrationReminders: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-lg hover:bg-slate-950">
              <span>Goal Milestones</span>
              <input
                type="checkbox"
                checked={prefsData.goalMilestones}
                onChange={(e) => setPrefsData({ ...prefsData, goalMilestones: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-lg hover:bg-slate-950">
              <span>Weekly Performance Reports</span>
              <input
                type="checkbox"
                checked={prefsData.weeklyReports}
                onChange={(e) => setPrefsData({ ...prefsData, weeklyReports: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-lg hover:bg-slate-950">
              <span>Push Notifications</span>
              <input
                type="checkbox"
                checked={prefsData.pushNotifications}
                onChange={(e) => setPrefsData({ ...prefsData, pushNotifications: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-emerald-500"
              />
            </label>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Alert Time</label>
              <input
                type="time"
                value={prefsData.reminderTime}
                onChange={(e) => setPrefsData({ ...prefsData, reminderTime: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-md shadow-emerald-500/20 mt-4"
            >
              Save Preferences
            </button>
          </form>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Reminder"
        description="Add a personalized reminder to your notifications."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
            <textarea
              rows={2}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
            >
              <option value="WORKOUT_REMINDER">WORKOUT_REMINDER</option>
              <option value="HYDRATION_REMINDER">HYDRATION_REMINDER</option>
              <option value="GOAL_ACHIEVED">GOAL_ACHIEVED</option>
              <option value="PR_BROKEN">PR_BROKEN</option>
              <option value="SYSTEM">SYSTEM</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
            >
              Create Reminder
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Notification"
        message="Are you sure you want to remove this notification?"
      />
    </div>
  );
}
