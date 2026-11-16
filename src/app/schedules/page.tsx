'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, Edit, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function SchedulesPage() {
  const { currentUserId, fetchWithAuth, showToast } = useApp();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    workoutPlanId: '',
    title: '',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '18:00',
    status: 'SCHEDULED',
    reminderMinutes: 30,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, pRes] = await Promise.all([
        fetchWithAuth('/api/schedules'),
        fetchWithAuth('/api/workout-plans'),
      ]);
      const sJson = await sRes.json();
      const pJson = await pRes.json();

      if (sJson.success) setSchedules(sJson.data);
      if (pJson.success) setPlans(pJson.data);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      workoutPlanId: plans[0]?.id || '',
      title: 'Upper Hypertrophy Session',
      description: 'Follow Upper Body A progression routine',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '18:00',
      status: 'SCHEDULED',
      reminderMinutes: 30,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s: any) => {
    setEditingId(s.id);
    setFormData({
      workoutPlanId: s.workoutPlanId || '',
      title: s.title,
      description: s.description || '',
      scheduledDate: s.scheduledDate,
      scheduledTime: s.scheduledTime || '18:00',
      status: s.status || 'SCHEDULED',
      reminderMinutes: s.reminderMinutes || 30,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/schedules/${editingId}` : '/api/schedules';

      const res = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        showToast(editingId ? 'Schedule updated!' : 'Workout scheduled!', 'success');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast(json.error || 'Failed to save schedule', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetchWithAuth(`/api/schedules/${deleteTargetId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Scheduled workout deleted.', 'info');
        setDeleteTargetId(null);
        loadData();
      } else {
        showToast(json.error || 'Failed to delete', 'error');
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
            <CalendarDays className="w-7 h-7 text-emerald-400" />
            Workout Schedules & Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Schedule future workout sessions, set notifications, and manage daily training appointments.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Schedule Workout
        </button>
      </div>

      {/* Schedule List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No workouts scheduled</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Plan your workouts ahead to stay on track.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950"
          >
            Schedule Next Workout
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{s.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : s.status === 'MISSED'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1 text-slate-300 font-semibold">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                    {s.scheduledDate} {s.scheduledTime && `@ ${s.scheduledTime}`}
                  </span>
                  {s.workoutPlan && (
                    <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      Plan: {s.workoutPlan.name}
                    </span>
                  )}
                  <span>Reminder: {s.reminderMinutes}m before</span>
                </div>

                {s.description && <p className="text-xs text-slate-400 mt-1 italic">"{s.description}"</p>}
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  onClick={() => openEditModal(s)}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTargetId(s.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Workout Schedule' : 'Schedule Workout'}
        description="Select date, time, and optional program routine."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Workout Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              placeholder="e.g. Pull Day Focus"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Scheduled Date</label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Time (HH:mm)</label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="MISSED">MISSED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reminder (mins)</label>
              <input
                type="number"
                value={formData.reminderMinutes}
                onChange={(e) => setFormData({ ...formData, reminderMinutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Workout Plan (optional)</label>
            <select
              value={formData.workoutPlanId}
              onChange={(e) => setFormData({ ...formData, workoutPlanId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
            >
              <option value="">No Plan Attached</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
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
              {editingId ? 'Save Changes' : 'Schedule Workout'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Workout Schedule"
        message="Are you sure you want to delete this scheduled workout?"
      />
    </div>
  );
}
