'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Edit,
  Dumbbell,
  Clock,
  Award,
  Calendar,
  CheckCircle2,
  PlusCircle,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function WorkoutsPage() {
  const { currentUserId, fetchWithAuth, showToast } = useApp();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [availableExercises, setAvailableExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    durationMinutes: 45,
    caloriesBurned: 350,
    rating: 5,
    status: 'COMPLETED',
    notes: '',
    exercises: [
      {
        exerciseId: '',
        orderIndex: 0,
        notes: '',
        sets: [{ setNumber: 1, setType: 'NORMAL', reps: 10, weightKg: 50, rpe: 8, isCompleted: true }],
      },
    ],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [wRes, eRes] = await Promise.all([
        fetchWithAuth('/api/workouts'),
        fetchWithAuth('/api/exercises'),
      ]);
      const wJson = await wRes.json();
      const eJson = await eRes.json();
      if (wJson.success) setWorkouts(wJson.data);
      if (eJson.success) setAvailableExercises(eJson.data);
    } catch (e: any) {
      showToast(e.message || 'Error loading workouts', 'error');
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
      title: 'Strength Session',
      durationMinutes: 45,
      caloriesBurned: 350,
      rating: 5,
      status: 'COMPLETED',
      notes: '',
      exercises: [
        {
          exerciseId: availableExercises[0]?.id || '',
          orderIndex: 0,
          notes: '',
          sets: [{ setNumber: 1, setType: 'NORMAL', reps: 10, weightKg: 60, rpe: 8, isCompleted: true }],
        },
      ],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (session: any) => {
    setEditingId(session.id);
    setFormData({
      title: session.title,
      durationMinutes: session.durationMinutes || 45,
      caloriesBurned: session.caloriesBurned || 350,
      rating: session.rating || 5,
      status: session.status || 'COMPLETED',
      notes: session.notes || '',
      exercises:
        session.exercises?.map((ex: any, idx: number) => ({
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex ?? idx,
          notes: ex.notes || '',
          sets: ex.sets?.map((s: any, sIdx: number) => ({
            setNumber: s.setNumber ?? sIdx + 1,
            setType: s.setType || 'NORMAL',
            reps: s.reps,
            weightKg: s.weightKg,
            rpe: s.rpe || 8,
            isCompleted: s.isCompleted !== false,
          })) || [{ setNumber: 1, setType: 'NORMAL', reps: 10, weightKg: 50, rpe: 8, isCompleted: true }],
        })) || [],
    });
    setIsModalOpen(true);
  };

  const addExerciseRow = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exerciseId: availableExercises[0]?.id || '',
          orderIndex: prev.exercises.length,
          notes: '',
          sets: [{ setNumber: 1, setType: 'NORMAL', reps: 10, weightKg: 40, rpe: 8, isCompleted: true }],
        },
      ],
    }));
  };

  const removeExerciseRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const addSetToExercise = (exIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev.exercises];
      const ex = updated[exIndex];
      const prevSet = ex.sets[ex.sets.length - 1];
      ex.sets.push({
        setNumber: ex.sets.length + 1,
        setType: 'NORMAL',
        reps: prevSet?.reps || 10,
        weightKg: prevSet?.weightKg || 50,
        rpe: 8,
        isCompleted: true,
      });
      return { ...prev, exercises: updated };
    });
  };

  const removeSetFromExercise = (exIndex: number, setIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev.exercises];
      updated[exIndex].sets = updated[exIndex].sets.filter((_, sIdx) => sIdx !== setIndex);
      return { ...prev, exercises: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/workouts/${editingId}` : '/api/workouts';

      const res = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        showToast(editingId ? 'Workout session updated successfully!' : 'New workout session created!', 'success');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast(json.error || 'Operation failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetchWithAuth(`/api/workouts/${deleteTargetId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Workout session deleted.', 'info');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flame className="w-7 h-7 text-emerald-400" />
            Workout Sessions & Sets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Log, inspect, update, and manage every workout session and nested exercise set.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Log Workout
        </button>
      </div>

      {/* Workout Sessions List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No workout sessions logged</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Click 'Log Workout' to record your exercises, sets, weights, and reps.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950"
          >
            Create First Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((session) => (
            <div
              key={session.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{session.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {session.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(session.startedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {session.durationMinutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5 text-slate-500" />
                      {session.totalVolumeKg?.toLocaleString()} kg total
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      {session.caloriesBurned} kcal
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => openEditModal(session)}
                    className="p-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5 text-emerald-400" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(session.id)}
                    className="p-2 text-xs font-medium rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {session.notes && (
                <p className="text-xs text-slate-400 italic mt-3 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                  "{session.notes}"
                </p>
              )}

              {/* Nested Exercises & Sets */}
              <div className="mt-4 space-y-3">
                {session.exercises?.map((we: any, idx: number) => (
                  <div key={we.id || idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-emerald-400">
                        {idx + 1}. {we.exercise?.name || 'Exercise'}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {we.exercise?.targetMuscle} • {we.exercise?.equipment}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {we.sets?.map((s: any) => (
                        <div
                          key={s.id || s.setNumber}
                          className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-center"
                        >
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Set {s.setNumber} ({s.setType})
                          </span>
                          <span className="text-xs font-bold text-white">
                            {s.weightKg}kg × {s.reps}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Workout Session' : 'Log New Workout Session'}
        description="Fill in session stats, exercises, weights, and reps. Changes persist directly to database."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Session Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
                placeholder="e.g. Chest & Triceps Hypertrophy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rating (1-5)</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              >
                <option value={5}>5 - Excellent Energy</option>
                <option value={4}>4 - Good Session</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Fatigued</option>
                <option value={1}>1 - Poor Recovery</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              >
                <option value="COMPLETED">COMPLETED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="PLANNED">PLANNED</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Calories Burned</label>
              <input
                type="number"
                value={formData.caloriesBurned}
                onChange={(e) => setFormData({ ...formData, caloriesBurned: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Highlights</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              placeholder="e.g. Hit clean PR on last set, rested 90 seconds"
            />
          </div>

          {/* Exercises & Sets Editor */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Workout Exercises</span>
              <button
                type="button"
                onClick={addExerciseRow}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Exercise
              </button>
            </div>

            <div className="space-y-4">
              {formData.exercises.map((ex, exIdx) => (
                <div key={exIdx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <select
                      value={ex.exerciseId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => {
                          const updated = [...prev.exercises];
                          updated[exIdx].exerciseId = val;
                          return { ...prev, exercises: updated };
                        });
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-emerald-500"
                    >
                      <option value="">Select Exercise</option>
                      {availableExercises.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.targetMuscle} • {e.equipment})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeExerciseRow(exIdx)}
                      className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/50"
                      title="Remove Exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sets for this exercise */}
                  <div className="space-y-2 pl-2">
                    {ex.sets.map((s, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 w-12 font-medium">Set {s.setNumber}:</span>
                        <input
                          type="number"
                          placeholder="kg"
                          value={s.weightKg}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setFormData((prev) => {
                              const updated = [...prev.exercises];
                              updated[exIdx].sets[sIdx].weightKg = val;
                              return { ...prev, exercises: updated };
                            });
                          }}
                          className="w-18 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white text-xs text-center"
                        />
                        <span className="text-slate-500">kg ×</span>
                        <input
                          type="number"
                          placeholder="reps"
                          value={s.reps}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setFormData((prev) => {
                              const updated = [...prev.exercises];
                              updated[exIdx].sets[sIdx].reps = val;
                              return { ...prev, exercises: updated };
                            });
                          }}
                          className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white text-xs text-center"
                        />
                        <span className="text-slate-500">reps</span>
                        <select
                          value={s.setType}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const updated = [...prev.exercises];
                              updated[exIdx].sets[sIdx].setType = val;
                              return { ...prev, exercises: updated };
                            });
                          }}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs"
                        >
                          <option value="NORMAL">Normal</option>
                          <option value="WARMUP">Warmup</option>
                          <option value="DROPSET">Dropset</option>
                          <option value="FAILURE">Failure</option>
                        </select>
                        {ex.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSetFromExercise(exIdx, sIdx)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addSetToExercise(exIdx)}
                      className="text-[11px] text-emerald-400 hover:underline mt-1 block"
                    >
                      + Add Set
                    </button>
                  </div>
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
              {editingId ? 'Save Changes' : 'Create Session'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Workout Session"
        message="Are you sure you want to permanently delete this workout session? All attached exercises and sets will be cascaded and deleted from PostgreSQL/SQLite."
      />
    </div>
  );
}
