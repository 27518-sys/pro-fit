'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit, Calendar, PlusCircle, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function PlansPage() {
  const { currentUserId, fetchWithAuth, showToast } = useApp();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'INTERMEDIATE',
    daysPerWeek: 4,
    isPublic: false,
    routines: [
      { dayOfWeek: 1, name: 'Upper Body A', targetMuscles: 'Chest, Back, Shoulders' },
      { dayOfWeek: 2, name: 'Lower Body A', targetMuscles: 'Quads, Hamstrings, Calves' },
    ],
  });

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/workout-plans');
      const json = await res.json();
      if (json.success) setPlans(json.data);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [currentUserId]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: 'PPL Hypertrophy Program',
      description: 'Structured 6-day split designed for hypertrophy and proportional strength.',
      difficulty: 'ADVANCED',
      daysPerWeek: 6,
      isPublic: true,
      routines: [
        { dayOfWeek: 1, name: 'Push Day (Chest/Delts/Triceps)', targetMuscles: 'Chest, Triceps' },
        { dayOfWeek: 2, name: 'Pull Day (Back/Biceps)', targetMuscles: 'Back, Biceps' },
        { dayOfWeek: 3, name: 'Legs Day (Quads/Hams/Glutes)', targetMuscles: 'Quads, Calves' },
      ],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: any) => {
    setEditingId(plan.id);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      difficulty: plan.difficulty || 'INTERMEDIATE',
      daysPerWeek: plan.daysPerWeek || 4,
      isPublic: plan.isPublic || false,
      routines: plan.routines?.map((r: any) => ({
        dayOfWeek: r.dayOfWeek,
        name: r.name,
        targetMuscles: r.targetMuscles || '',
      })) || [],
    });
    setIsModalOpen(true);
  };

  const addRoutineRow = () => {
    setFormData((prev) => ({
      ...prev,
      routines: [
        ...prev.routines,
        {
          dayOfWeek: prev.routines.length + 1,
          name: `Workout Day ${prev.routines.length + 1}`,
          targetMuscles: 'Full Body',
        },
      ],
    }));
  };

  const removeRoutineRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      routines: prev.routines.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/workout-plans/${editingId}` : '/api/workout-plans';

      const res = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        showToast(editingId ? 'Workout plan updated!' : 'New workout plan created!', 'success');
        setIsModalOpen(false);
        loadPlans();
      } else {
        showToast(json.error || 'Failed to save workout plan', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetchWithAuth(`/api/workout-plans/${deleteTargetId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Workout plan deleted.', 'info');
        setDeleteTargetId(null);
        loadPlans();
      } else {
        showToast(json.error || 'Failed to delete plan', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-emerald-400" />
            Workout Plans & Periodization
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, manage, and schedule multi-day training splits and routines.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No workout plans created</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Structure your training by designing a customized weekly workout split.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950"
          >
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {plan.difficulty}
                      </span>
                      <span className="text-xs text-slate-400">
                        {plan.daysPerWeek} days/week
                      </span>
                      {plan.isPublic && (
                        <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 font-semibold">
                          Public
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                      title="Edit Plan"
                    >
                      <Edit className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(plan.id)}
                      className="p-1.5 text-xs rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                    {plan.description}
                  </p>
                )}

                {/* Routines in this plan */}
                <div className="mt-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Weekly Routines ({plan.routines?.length || 0})
                  </span>
                  {plan.routines?.map((r: any) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/70 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                          {r.dayOfWeek}
                        </span>
                        <span className="font-semibold text-slate-200">{r.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{r.targetMuscles || 'General'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Workout Plan' : 'Create Workout Plan'}
        description="Design a structured program with day-by-day routines and target muscles."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              placeholder="e.g. Upper Lower 4-Day Strength"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Days Per Week</label>
              <input
                type="number"
                min="1"
                max="7"
                required
                value={formData.daysPerWeek}
                onChange={(e) => setFormData({ ...formData, daysPerWeek: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              placeholder="Program overview and progression scheme..."
            />
          </div>

          {/* Routines list */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Plan Routines</span>
              <button
                type="button"
                onClick={addRoutineRow}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Routine
              </button>
            </div>

            <div className="space-y-2">
              {formData.routines.map((r, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold w-6 text-center">#{idx + 1}</span>
                  <input
                    type="text"
                    placeholder="Routine Name (e.g. Push Day)"
                    value={r.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => {
                        const updated = [...prev.routines];
                        updated[idx].name = val;
                        return { ...prev, routines: updated };
                      });
                    }}
                    className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Muscles (e.g. Chest, Triceps)"
                    value={r.targetMuscles}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => {
                        const updated = [...prev.routines];
                        updated[idx].targetMuscles = val;
                        return { ...prev, routines: updated };
                      });
                    }}
                    className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                  {formData.routines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRoutineRow(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              {editingId ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Workout Plan"
        message="Are you sure you want to permanently delete this workout plan? All nested routines will be cascaded and deleted."
      />
    </div>
  );
}
