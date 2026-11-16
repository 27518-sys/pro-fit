'use client';

import React, { useState, useEffect } from 'react';
import { Droplet, Plus, Trash2, Edit, Target, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function HydrationPage() {
  const { currentUserId, fetchWithAuth, showToast } = useApp();
  const [logs, setLogs] = useState<any[]>([]);
  const [target, setTarget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Target modal
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetFormData, setTargetFormData] = useState({
    dailyTargetMl: 3000,
    reminderIntervalMins: 60,
    autoAdjustForActivity: true,
  });

  // Log form
  const [formData, setFormData] = useState({
    date: selectedDate,
    amountMl: 250,
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [lRes, tRes] = await Promise.all([
        fetchWithAuth(`/api/water?date=${selectedDate}`),
        fetchWithAuth('/api/water/target'),
      ]);
      const lJson = await lRes.json();
      const tJson = await tRes.json();

      if (lJson.success) setLogs(lJson.data);
      if (tJson.success) {
        setTarget(tJson.data);
        setTargetFormData({
          dailyTargetMl: tJson.data.dailyTargetMl || 3000,
          reminderIntervalMins: tJson.data.reminderIntervalMins || 60,
          autoAdjustForActivity: tJson.data.autoAdjustForActivity ?? true,
        });
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserId, selectedDate]);

  const quickAdd = async (amount: number) => {
    try {
      const res = await fetchWithAuth('/api/water', {
        method: 'POST',
        body: JSON.stringify({ date: selectedDate, amountMl: amount, notes: 'Quick hydration add' }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Logged +${amount} ml!`, 'success');
        loadData();
      } else {
        showToast(json.error, 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/water/${editingId}` : '/api/water';

      const res = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        showToast(editingId ? 'Hydration entry updated!' : 'Hydration entry logged!', 'success');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast(json.error || 'Failed to save', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleTargetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/water/target', {
        method: 'PUT',
        body: JSON.stringify(targetFormData),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Hydration target updated!', 'success');
        setIsTargetModalOpen(false);
        loadData();
      } else {
        showToast(json.error, 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetchWithAuth(`/api/water/${deleteTargetId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Water entry deleted.', 'info');
        setDeleteTargetId(null);
        loadData();
      } else {
        showToast(json.error || 'Failed to delete', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const currentTotal = logs.reduce((sum, item) => sum + item.amountMl, 0);
  const targetMl = target?.dailyTargetMl || 3000;
  const progressPercent = Math.min(100, Math.round((currentTotal / targetMl) * 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Droplet className="w-7 h-7 text-cyan-400" />
            Hydration Tracker & Targets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Log water consumption, configure smart hydration intervals, and hit daily fluid targets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => setIsTargetModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition flex items-center gap-1.5"
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            Set Target
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ date: selectedDate, amountMl: 250, notes: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Log Water
          </button>
        </div>
      </div>

      {/* Main Hydration Progress Card */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 border border-slate-800 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="inline-flex p-3 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Droplet className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">
              {currentTotal.toLocaleString()} <span className="text-xl font-medium text-slate-400">/ {targetMl.toLocaleString()} ml</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {progressPercent >= 100
                ? '🎉 Congratulations! Daily hydration target reached.'
                : `${(targetMl - currentTotal).toLocaleString()} ml remaining today (${progressPercent}% completed)`}
            </p>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[250, 500, 750, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => quickAdd(amt)}
                className="py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-700/50 text-cyan-300 font-bold text-xs transition"
              >
                +{amt}ml
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log History */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Today's Hydration Entries</h3>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center italic">
            No water logged yet today. Use the buttons above to record your intake.
          </p>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {logs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-950/50 text-cyan-400 border border-cyan-800/40">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm">{log.amountMl} ml</span>
                    <p className="text-[11px] text-slate-400">
                      Logged at {new Date(log.loggedAt || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {log.notes && ` • "${log.notes}"`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingId(log.id);
                      setFormData({ date: log.date, amountMl: log.amountMl, notes: log.notes || '' });
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(log.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Water Entry' : 'Log Water Intake'}
        description="Enter consumed amount in milliliters."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (ml)</label>
            <input
              type="number"
              min="10"
              max="5000"
              required
              value={formData.amountMl}
              onChange={(e) => setFormData({ ...formData, amountMl: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 outline-none"
              placeholder="e.g. Morning glass with electrolytes"
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
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
            >
              {editingId ? 'Save Changes' : 'Log Water'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Target Modal */}
      <Modal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        title="Configure Hydration Target"
        description="Set your daily intake goal and smart reminder intervals."
      >
        <form onSubmit={handleTargetSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Target (ml)</label>
            <input
              type="number"
              min="500"
              max="15000"
              required
              value={targetFormData.dailyTargetMl}
              onChange={(e) => setTargetFormData({ ...targetFormData, dailyTargetMl: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reminder Interval (minutes)</label>
            <input
              type="number"
              min="15"
              max="360"
              required
              value={targetFormData.reminderIntervalMins}
              onChange={(e) => setTargetFormData({ ...targetFormData, reminderIntervalMins: parseInt(e.target.value) || 60 })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoAdjust"
              checked={targetFormData.autoAdjustForActivity}
              onChange={(e) => setTargetFormData({ ...targetFormData, autoAdjustForActivity: e.target.checked })}
              className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
            />
            <label htmlFor="autoAdjust" className="text-xs text-slate-300">
              Auto-adjust target based on workout duration & calories
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsTargetModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
            >
              Save Target
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Hydration Entry"
        message="Are you sure you want to delete this water intake log?"
      />
    </div>
  );
}
