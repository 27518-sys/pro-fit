'use client';

import React, { useState, useEffect } from 'react';
import { Scale, Plus, Trash2, Edit, TrendingDown, Calendar } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function MeasurementsPage() {
  const { currentUserId, fetchWithAuth, showToast } = useApp();
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weightKg: 78.0,
    bodyFatPercentage: 15.0,
    chestCm: 104.0,
    waistCm: 82.0,
    hipsCm: 98.0,
    bicepsCm: 38.0,
    thighsCm: 60.0,
    notes: '',
  });

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/measurements');
      const json = await res.json();
      if (json.success) setMeasurements(json.data);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeasurements();
  }, [currentUserId]);

  const openCreateModal = () => {
    setEditingId(null);
    const last = measurements[0];
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weightKg: last?.weightKg || 78.0,
      bodyFatPercentage: last?.bodyFatPercentage || 15.0,
      chestCm: last?.chestCm || 104.0,
      waistCm: last?.waistCm || 82.0,
      hipsCm: last?.hipsCm || 98.0,
      bicepsCm: last?.bicepsCm || 38.0,
      thighsCm: last?.thighsCm || 60.0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (m: any) => {
    setEditingId(m.id);
    setFormData({
      date: m.date,
      weightKg: m.weightKg,
      bodyFatPercentage: m.bodyFatPercentage || 15.0,
      chestCm: m.chestCm || 104.0,
      waistCm: m.waistCm || 82.0,
      hipsCm: m.hipsCm || 98.0,
      bicepsCm: m.bicepsCm || 38.0,
      thighsCm: m.thighsCm || 60.0,
      notes: m.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/measurements/${editingId}` : '/api/measurements';

      const res = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        showToast(editingId ? 'Measurement updated!' : 'New measurement recorded!', 'success');
        setIsModalOpen(false);
        loadMeasurements();
      } else {
        showToast(json.error || 'Failed to save measurement', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetchWithAuth(`/api/measurements/${deleteTargetId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Measurement deleted.', 'info');
        setDeleteTargetId(null);
        loadMeasurements();
      } else {
        showToast(json.error || 'Failed to delete', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Prepare chart data (chronological)
  const chartData = [...measurements]
    .reverse()
    .map((m) => ({
      date: m.date,
      weight: m.weightKg,
      bodyFat: m.bodyFatPercentage,
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scale className="w-7 h-7 text-emerald-400" />
            Body Weight & Anthropometrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Log body weight, body fat %, and circumference measurements with visual progress analytics.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Record Measurement
        </button>
      </div>

      {/* Weight Trend Chart */}
      {chartData.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Body Weight Trajectory (kg)</h3>
              <p className="text-xs text-slate-400">Track lean cut or muscle gain over time</p>
            </div>
            {measurements.length >= 2 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <TrendingDown className="w-3.5 h-3.5" />
                {(measurements[0].weightKg - measurements[measurements.length - 1].weightKg).toFixed(1)} kg delta
              </div>
            )}
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: any) => [`${value} kg`, 'Weight']}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Measurements Table / Cards */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Measurement History</h3>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : measurements.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center italic">
            No measurements recorded yet. Click 'Record Measurement' to add your baseline.
          </p>
        ) : (
          <div className="space-y-3">
            {measurements.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-300">{m.date}</span>
                    <span className="text-base font-extrabold text-white ml-2">{m.weightKg} kg</span>
                    {m.bodyFatPercentage && (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                        {m.bodyFatPercentage}% BF
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-2">
                    {m.waistCm && <span>Waist: <b className="text-slate-200">{m.waistCm}cm</b></span>}
                    {m.chestCm && <span>Chest: <b className="text-slate-200">{m.chestCm}cm</b></span>}
                    {m.hipsCm && <span>Hips: <b className="text-slate-200">{m.hipsCm}cm</b></span>}
                    {m.bicepsCm && <span>Arms: <b className="text-slate-200">{m.bicepsCm}cm</b></span>}
                    {m.thighsCm && <span>Thighs: <b className="text-slate-200">{m.thighsCm}cm</b></span>}
                  </div>

                  {m.notes && <p className="text-xs text-slate-500 italic mt-1.5">"{m.notes}"</p>}
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => openEditModal(m)}
                    className="p-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    <Edit className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(m.id)}
                    className="p-2 text-xs font-medium rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Measurement' : 'Record Body Metrics'}
        description="Save your weight and circumference measurements."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Body Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Body Fat %</label>
              <input
                type="number"
                step="0.1"
                value={formData.bodyFatPercentage}
                onChange={(e) => setFormData({ ...formData, bodyFatPercentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Waist (cm)</label>
              <input
                type="number"
                step="0.5"
                value={formData.waistCm}
                onChange={(e) => setFormData({ ...formData, waistCm: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chest (cm)</label>
              <input
                type="number"
                step="0.5"
                value={formData.chestCm}
                onChange={(e) => setFormData({ ...formData, chestCm: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hips (cm)</label>
              <input
                type="number"
                step="0.5"
                value={formData.hipsCm}
                onChange={(e) => setFormData({ ...formData, hipsCm: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Biceps (cm)</label>
              <input
                type="number"
                step="0.5"
                value={formData.bicepsCm}
                onChange={(e) => setFormData({ ...formData, bicepsCm: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Thighs (cm)</label>
              <input
                type="number"
                step="0.5"
                value={formData.thighsCm}
                onChange={(e) => setFormData({ ...formData, thighsCm: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              placeholder="e.g. Fasted morning check-in after refeed"
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
              {editingId ? 'Save Changes' : 'Record Measurement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Measurement Record"
        message="Are you sure you want to delete this body measurement entry?"
      />
    </div>
  );
}
