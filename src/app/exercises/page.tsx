'use client';

import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  Lock,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function ExercisesPage() {
  const { currentUserId, fetchWithAuth, showToast } = useApp();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'STRENGTH',
    targetMuscle: 'CHEST',
    secondaryMuscle: '',
    equipment: 'BARBELL',
    difficulty: 'INTERMEDIATE',
    description: '',
    instructions: '',
  });

  const loadExercises = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/exercises');
      const json = await res.json();
      if (json.success) setExercises(json.data);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [currentUserId]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'STRENGTH',
      targetMuscle: 'CHEST',
      secondaryMuscle: '',
      equipment: 'BARBELL',
      difficulty: 'INTERMEDIATE',
      description: '',
      instructions: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ex: any) => {
    if (ex.isSystem) {
      showToast('System-owned exercises cannot be edited.', 'error');
      return;
    }
    setEditingId(ex.id);
    setFormData({
      name: ex.name,
      category: ex.category || 'STRENGTH',
      targetMuscle: ex.targetMuscle || 'CHEST',
      secondaryMuscle: ex.secondaryMuscle || '',
      equipment: ex.equipment || 'BARBELL',
      difficulty: ex.difficulty || 'INTERMEDIATE',
      description: ex.description || '',
      instructions: ex.instructions || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/exercises/${editingId}` : '/api/exercises';

      const res = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        showToast(editingId ? 'Exercise updated!' : 'Custom exercise created!', 'success');
        setIsModalOpen(false);
        loadExercises();
      } else {
        showToast(json.error || 'Failed to save exercise', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetchWithAuth(`/api/exercises/${deleteTargetId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Exercise removed from library.', 'info');
        setDeleteTargetId(null);
        loadExercises();
      } else {
        showToast(json.error || 'Failed to delete exercise', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.description?.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === 'ALL' || ex.targetMuscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-7 h-7 text-emerald-400" />
            Exercise Library Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Browse verified system exercises or create, customize, and manage personal movements.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create Custom Exercise
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search exercises by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <select
          value={selectedMuscle}
          onChange={(e) => setSelectedMuscle(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Muscle Groups</option>
          <option value="CHEST">Chest</option>
          <option value="BACK">Back</option>
          <option value="LEGS">Legs</option>
          <option value="SHOULDERS">Shoulders</option>
          <option value="ARMS">Arms</option>
          <option value="CORE">Core</option>
          <option value="FULL_BODY">Full Body</option>
        </select>
      </div>

      {/* Exercises Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No exercises match your filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try another search keyword or create a custom exercise.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ex) => (
            <div
              key={ex.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white leading-tight">{ex.name}</h3>
                  {ex.isSystem ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3" /> System
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 shrink-0">
                      Custom
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[10px] font-semibold border border-slate-800">
                    {ex.targetMuscle}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[10px] font-semibold border border-slate-800">
                    {ex.equipment}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 text-[10px] border border-slate-800">
                    {ex.difficulty}
                  </span>
                </div>

                {ex.description && (
                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {ex.description}
                  </p>
                )}

                {ex.instructions && (
                  <p className="text-[11px] text-slate-500 mt-2 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                    "{ex.instructions}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
                {ex.isSystem ? (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-600" /> System protected
                  </span>
                ) : (
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => openEditModal(ex)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3 text-emerald-400" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(ex.id)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Custom Exercise' : 'Create Custom Exercise'}
        description="Add a personalized exercise to your workout library. Full CRUD permanent persistence."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Exercise Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              placeholder="e.g. Bulgarian Split Squat with Pause"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Muscle</label>
              <select
                value={formData.targetMuscle}
                onChange={(e) => setFormData({ ...formData, targetMuscle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              >
                <option value="CHEST">CHEST</option>
                <option value="BACK">BACK</option>
                <option value="LEGS">LEGS</option>
                <option value="SHOULDERS">SHOULDERS</option>
                <option value="ARMS">ARMS</option>
                <option value="CORE">CORE</option>
                <option value="FULL_BODY">FULL_BODY</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Equipment</label>
              <select
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              >
                <option value="BARBELL">BARBELL</option>
                <option value="DUMBBELL">DUMBBELL</option>
                <option value="CABLE">CABLE</option>
                <option value="MACHINE">MACHINE</option>
                <option value="BODYWEIGHT">BODYWEIGHT</option>
                <option value="BANDS">BANDS</option>
                <option value="KETTLEBELL">KETTLEBELL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              >
                <option value="STRENGTH">STRENGTH</option>
                <option value="CARDIO">CARDIO</option>
                <option value="HIIT">HIIT</option>
                <option value="BODYWEIGHT">BODYWEIGHT</option>
                <option value="FLEXIBILITY">FLEXIBILITY</option>
              </select>
            </div>
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Focus</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              placeholder="Targeted muscle biomechanics and benefits..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Execution Form Instructions</label>
            <textarea
              rows={2}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              placeholder="Step-by-step setup and cues..."
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
              {editingId ? 'Save Changes' : 'Create Exercise'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Custom Exercise"
        message="Are you sure you want to permanently delete this custom exercise? It will be removed from your exercise library."
      />
    </div>
  );
}
