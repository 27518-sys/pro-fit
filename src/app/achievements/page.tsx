'use client';

import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2, Edit, ShieldCheck, Flame, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function AchievementsPage() {
  const { currentUserId, fetchWithAuth, showToast } = useApp();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    title: '',
    description: '',
    icon: 'Award',
    badgeColor: 'amber',
    criteriaType: 'WORKOUT_COUNT',
    criteriaValue: 10,
    points: 100,
  });

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/achievements');
      const json = await res.json();
      if (json.success) setAchievements(json.data);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, [currentUserId]);

  const openCreateModal = () => {
    setEditingId(null);
    const randomKey = `CUSTOM_ACH_${Math.floor(Math.random() * 9000 + 1000)}`;
    setFormData({
      key: randomKey,
      title: '100 Workouts Completed',
      description: 'Demonstrate unstoppable persistence across 100 training sessions.',
      icon: 'Award',
      badgeColor: 'emerald',
      criteriaType: 'WORKOUT_COUNT',
      criteriaValue: 100,
      points: 250,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ach: any) => {
    if (ach.isSystem) {
      showToast('System predefined achievements cannot be modified.', 'error');
      return;
    }
    setEditingId(ach.id);
    setFormData({
      key: ach.key,
      title: ach.title,
      description: ach.description,
      icon: ach.icon || 'Award',
      badgeColor: ach.badgeColor || 'amber',
      criteriaType: ach.criteriaType || 'WORKOUT_COUNT',
      criteriaValue: ach.criteriaValue || 10,
      points: ach.points || 100,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/achievements/${editingId}` : '/api/achievements';

      const res = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        showToast(editingId ? 'Achievement updated!' : 'Custom achievement created!', 'success');
        setIsModalOpen(false);
        loadAchievements();
      } else {
        showToast(json.error || 'Failed to save achievement', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetchWithAuth(`/api/achievements/${deleteTargetId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Achievement deleted.', 'info');
        setDeleteTargetId(null);
        loadAchievements();
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
            <Award className="w-7 h-7 text-amber-400" />
            Achievements & Trophies
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Earn official badges and configure personalized milestones for your fitness journey.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create Custom Achievement
        </button>
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No achievements configured</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                ach.unlockedAt
                  ? 'bg-slate-900/90 border-amber-500/30 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-900/60 border-slate-800 opacity-90'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        ach.unlockedAt
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{ach.title}</h3>
                      <span className="text-[10px] text-amber-400 font-bold block">
                        +{ach.points} Points
                      </span>
                    </div>
                  </div>

                  {ach.isSystem ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3" /> System
                    </span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(ach)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(ach.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  {ach.description}
                </p>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span>Criteria: {ach.criteriaType} ({ach.criteriaValue})</span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                {ach.unlockedAt ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    ✓ Unlocked on {new Date(ach.unlockedAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Achievement' : 'Create Custom Achievement'}
        description="Define milestone conditions and reward point values."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Unique Key Identifier</label>
            <input
              type="text"
              required
              disabled={!!editingId}
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Criteria Type</label>
              <select
                value={formData.criteriaType}
                onChange={(e) => setFormData({ ...formData, criteriaType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 outline-none"
              >
                <option value="WORKOUT_COUNT">WORKOUT_COUNT</option>
                <option value="VOLUME_KG">VOLUME_KG</option>
                <option value="STREAK_DAYS">STREAK_DAYS</option>
                <option value="PR_COUNT">PR_COUNT</option>
                <option value="WATER_DAYS">WATER_DAYS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reward Points</label>
              <input
                type="number"
                min="1"
                required
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 outline-none"
              />
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
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/20"
            >
              {editingId ? 'Save Changes' : 'Create Achievement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Custom Achievement"
        message="Are you sure you want to delete this custom achievement?"
      />
    </div>
  );
}
