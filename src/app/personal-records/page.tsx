'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Trash2, Edit, Calculator, Dumbbell, Calendar, Award } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function PersonalRecordsPage() {
  const { currentUserId, fetchWithAuth, showToast } = useApp();
  const [records, setRecords] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1RM calculator state
  const [calcWeight, setCalcWeight] = useState(100);
  const [calcReps, setCalcReps] = useState(5);
  const estimated1RM = Math.round(calcWeight * (1 + calcReps / 30));

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    exerciseId: '',
    recordType: 'MAX_WEIGHT',
    value: 100,
    unit: 'kg',
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, eRes] = await Promise.all([
        fetchWithAuth('/api/personal-records'),
        fetchWithAuth('/api/exercises'),
      ]);
      const rJson = await rRes.json();
      const eJson = await eRes.json();

      if (rJson.success) setRecords(rJson.data);
      if (eJson.success) {
        setExercises(eJson.data);
        if (!formData.exerciseId && eJson.data.length > 0) {
          setFormData((prev) => ({ ...prev, exerciseId: eJson.data[0].id }));
        }
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

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      exerciseId: exercises[0]?.id || '',
      recordType: 'MAX_WEIGHT',
      value: 100,
      unit: 'kg',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rec: any) => {
    setEditingId(rec.id);
    setFormData({
      exerciseId: rec.exerciseId,
      recordType: rec.recordType || 'MAX_WEIGHT',
      value: rec.value,
      unit: rec.unit || 'kg',
      notes: rec.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/personal-records/${editingId}` : '/api/personal-records';

      const res = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        showToast(editingId ? 'PR updated!' : 'Personal record logged! 🏆', 'success');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast(json.error || 'Failed to save PR', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetchWithAuth(`/api/personal-records/${deleteTargetId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Personal record deleted.', 'info');
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
            <Trophy className="w-7 h-7 text-amber-400" />
            Personal Records (PRs)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Log all-time single-rep maximums, rep PRs, and calculate estimated 1RMs.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Record New PR
        </button>
      </div>

      {/* 1RM Calculator Widget */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            One-Rep Max (1RM) Estimator (Epley Formula)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Lifted Weight (kg)</label>
            <input
              type="number"
              value={calcWeight}
              onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Repetitions Performed</label>
            <input
              type="number"
              value={calcReps}
              onChange={(e) => setCalcReps(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
            />
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
            <span className="text-[10px] text-amber-400 font-semibold uppercase block">Estimated 1RM</span>
            <span className="text-2xl font-black text-amber-300">{estimated1RM} kg</span>
          </div>
        </div>
      </div>

      {/* PRs Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No personal records logged</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Record your best lifts and benchmark milestones.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950"
          >
            Record Your First PR
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{rec.exercise?.name}</h3>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        {rec.exercise?.targetMuscle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(rec)}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(rec.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="my-4 text-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    {rec.recordType.replace('_', ' ')}
                  </span>
                  <span className="text-3xl font-black text-amber-400">
                    {rec.value} <span className="text-sm font-bold text-slate-400">{rec.unit}</span>
                  </span>
                </div>

                {rec.notes && <p className="text-xs text-slate-400 italic">"{rec.notes}"</p>}
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Achieved on</span>
                <span>{new Date(rec.achievedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Personal Record' : 'Record New PR'}
        description="Save your benchmark weight or rep achievements."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Exercise</label>
            <select
              value={formData.exerciseId}
              onChange={(e) => setFormData({ ...formData, exerciseId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 outline-none"
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.targetMuscle})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Record Type</label>
              <select
                value={formData.recordType}
                onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 outline-none"
              >
                <option value="MAX_WEIGHT">MAX_WEIGHT</option>
                <option value="MAX_REPS">MAX_REPS</option>
                <option value="MAX_VOLUME">MAX_VOLUME</option>
                <option value="BEST_TIME">BEST_TIME</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Value & Unit</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 outline-none"
                />
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-16 px-2 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Cues</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 outline-none"
              placeholder="e.g. Pause bench at chest, clean lockout"
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
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/20"
            >
              {editingId ? 'Save Changes' : 'Record PR'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Personal Record"
        message="Are you sure you want to delete this personal record?"
      />
    </div>
  );
}
