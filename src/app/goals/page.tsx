'use client';

import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Edit, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function GoalsPage() {
  const { currentUserId, fetchWithAuth, showToast } = useApp();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'WEIGHT',
    targetValue: 75,
    currentValue: 78.5,
    unit: 'kg',
    targetDate: '2026-12-31',
    isCompleted: false,
  });

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/goals');
      const json = await res.json();
      if (json.success) setGoals(json.data);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [currentUserId]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: 'Hit 140kg Deadlift 1RM',
      description: 'Progressive overload training target before year-end',
      category: 'STRENGTH',
      targetValue: 140,
      currentValue: 125,
      unit: 'kg',
      targetDate: '2026-12-31',
      isCompleted: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (g: any) => {
    setEditingId(g.id);
    setFormData({
      title: g.title,
      description: g.description || '',
      category: g.category || 'WEIGHT',
      targetValue: g.targetValue,
      currentValue: g.currentValue,
      unit: g.unit || 'kg',
      targetDate: g.targetDate || '',
      isCompleted: g.isCompleted || false,
    });
    setIsModalOpen(true);
  };

  const updateProgress = async (id: string, currentValue: number) => {
    try {
      const res = await fetchWithAuth(`/api/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ currentValue }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Goal progress updated!', 'success');
        loadGoals();
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const toggleCompleted = async (goal: any) => {
    try {
      const res = await fetchWithAuth(`/api/goals/${goal.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isCompleted: !goal.isCompleted }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(goal.isCompleted ? 'Goal reopened' : 'Goal marked complete! 🏆', 'success');
        loadGoals();
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/goals/${editingId}` : '/api/goals';

      const res = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        showToast(editingId ? 'Goal updated!' : 'Fitness goal created!', 'success');
        setIsModalOpen(false);
        loadGoals();
      } else {
        showToast(json.error || 'Failed to save goal', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetchWithAuth(`/api/goals/${deleteTargetId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Fitness goal deleted.', 'info');
        setDeleteTargetId(null);
        loadGoals();
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
            <Target className="w-7 h-7 text-emerald-400" />
            Fitness Goals & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Define target milestones, track real-time progress, and celebrate accomplishments.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create New Goal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No fitness goals active</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Setting clear targets significantly improves workout consistency and results.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                goal.isCompleted
                  ? 'bg-slate-900/40 border-emerald-900/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-base font-bold ${
                          goal.isCompleted ? 'text-emerald-400 line-through' : 'text-white'
                        }`}
                      >
                        {goal.title}
                      </h3>
                      {goal.isCompleted && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          Completed
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 text-slate-400 border border-slate-800 mt-1 inline-block">
                      {goal.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleCompleted(goal)}
                      className={`p-1.5 rounded-lg border transition ${
                        goal.isCompleted
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-emerald-400'
                      }`}
                      title="Toggle Complete"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(goal.id)}
                      className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    {goal.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-300">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="text-emerald-400 font-bold">{goal.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Quick inline value adjuster */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Update value:</span>
                  <input
                    type="number"
                    step="0.5"
                    defaultValue={goal.currentValue}
                    onBlur={(e) => updateProgress(goal.id, parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-white text-xs text-center"
                  />
                  <span className="text-[11px] text-slate-500">{goal.unit}</span>
                  {goal.targetDate && (
                    <span className="ml-auto text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due {goal.targetDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Fitness Goal' : 'Create Fitness Goal'}
        description="Set quantifiable targets with due dates and real-time tracking."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              placeholder="e.g. Bench Press 120 kg Single"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              >
                <option value="WEIGHT">WEIGHT</option>
                <option value="STRENGTH">STRENGTH</option>
                <option value="ENDURANCE">ENDURANCE</option>
                <option value="HABIT">HABIT</option>
                <option value="NUTRITION">NUTRITION</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
                placeholder="kg, reps, mins, sessions"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Value</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Value</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Date</label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isCompleted}
                  onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500"
                />
                Mark as completed
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Plan</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              placeholder="Strategic steps to achieve this goal..."
            />
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
              {editingId ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Fitness Goal"
        message="Are you sure you want to permanently delete this fitness goal?"
      />
    </div>
  );
}
