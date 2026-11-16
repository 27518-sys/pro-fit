'use client';

import React, { useState, useEffect } from 'react';
import { Apple, Plus, Trash2, Edit, Star, Flame, Sparkles, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function NutritionPage() {
  const { currentUserId, fetchWithAuth, showToast } = useApp();
  const [logs, setLogs] = useState<any[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Favorite Food Modal
  const [isFavModalOpen, setIsFavModalOpen] = useState(false);
  const [editingFavId, setEditingFavId] = useState<string | null>(null);
  const [deleteFavTargetId, setDeleteFavTargetId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    date: selectedDate,
    mealType: 'BREAKFAST',
    foodName: '',
    calories: 300,
    proteinG: 25,
    carbsG: 30,
    fatG: 8,
    fiberG: 4,
    servingSize: 100,
    servingUnit: 'g',
    notes: '',
  });

  const [favFormData, setFavFormData] = useState({
    name: '',
    brand: '',
    calories: 150,
    proteinG: 20,
    carbsG: 5,
    fatG: 2,
    fiberG: 1,
    defaultServing: 100,
    servingUnit: 'g',
    isFavorite: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [nRes, fRes, pRes] = await Promise.all([
        fetchWithAuth(`/api/nutrition?date=${selectedDate}`),
        fetchWithAuth('/api/favorite-foods'),
        fetchWithAuth('/api/profile'),
      ]);
      const nJson = await nRes.json();
      const fJson = await fRes.json();
      const pJson = await pRes.json();

      if (nJson.success) setLogs(nJson.data);
      if (fJson.success) setFavoriteFoods(fJson.data);
      if (pJson.success) setProfile(pJson.data);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserId, selectedDate]);

  const openCreateModal = (mealType = 'BREAKFAST') => {
    setEditingId(null);
    setFormData({
      date: selectedDate,
      mealType,
      foodName: '',
      calories: 350,
      proteinG: 30,
      carbsG: 35,
      fatG: 10,
      fiberG: 5,
      servingSize: 150,
      servingUnit: 'g',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (log: any) => {
    setEditingId(log.id);
    setFormData({
      date: log.date,
      mealType: log.mealType,
      foodName: log.foodName,
      calories: log.calories,
      proteinG: log.proteinG,
      carbsG: log.carbsG,
      fatG: log.fatG,
      fiberG: log.fiberG || 0,
      servingSize: log.servingSize,
      servingUnit: log.servingUnit || 'g',
      notes: log.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/api/nutrition/${editingId}` : '/api/nutrition';

      const res = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        showToast(editingId ? 'Nutrition record updated!' : 'Food entry logged!', 'success');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast(json.error || 'Failed to save nutrition record', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetchWithAuth(`/api/nutrition/${deleteTargetId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Food entry deleted.', 'info');
        setDeleteTargetId(null);
        loadData();
      } else {
        showToast(json.error || 'Failed to delete', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Favorite food quick-log
  const logFavoriteFood = async (food: any, mealType = 'LUNCH') => {
    try {
      const res = await fetchWithAuth('/api/nutrition', {
        method: 'POST',
        body: JSON.stringify({
          date: selectedDate,
          mealType,
          foodName: food.name,
          calories: food.calories,
          proteinG: food.proteinG,
          carbsG: food.carbsG,
          fatG: food.fatG,
          fiberG: food.fiberG,
          servingSize: food.defaultServing,
          servingUnit: food.servingUnit,
          notes: food.brand ? `Brand: ${food.brand}` : '',
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Logged ${food.name}!`, 'success');
        loadData();
      } else {
        showToast(json.error, 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleFavSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingFavId ? 'PUT' : 'POST';
      const endpoint = editingFavId ? `/api/favorite-foods/${editingFavId}` : '/api/favorite-foods';

      const res = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(favFormData),
      });

      const json = await res.json();
      if (json.success) {
        showToast(editingFavId ? 'Favorite food updated!' : 'Favorite food saved!', 'success');
        setIsFavModalOpen(false);
        loadData();
      } else {
        showToast(json.error || 'Failed to save favorite food', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleFavDelete = async () => {
    if (!deleteFavTargetId) return;
    try {
      const res = await fetchWithAuth(`/api/favorite-foods/${deleteFavTargetId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Favorite food removed.', 'info');
        setDeleteFavTargetId(null);
        loadData();
      } else {
        showToast(json.error || 'Failed to delete', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Aggregated totals
  const totalCalories = logs.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = Math.round(logs.reduce((sum, item) => sum + item.proteinG, 0));
  const totalCarbs = Math.round(logs.reduce((sum, item) => sum + item.carbsG, 0));
  const totalFat = Math.round(logs.reduce((sum, item) => sum + item.fatG, 0));

  const targetCalories = profile?.dailyCalorieTarget || 2200;
  const targetProtein = profile?.dailyProteinTargetG || 140;
  const targetCarbs = profile?.dailyCarbTargetG || 250;
  const targetFat = profile?.dailyFatTargetG || 65;

  const meals = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Apple className="w-7 h-7 text-emerald-400" />
            Food Records & Daily Nutrition
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Log meals, track macronutrients, and manage frequently used favorite foods.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => openCreateModal('BREAKFAST')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Log Food
          </button>
        </div>
      </div>

      {/* Macro Summary Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <span className="text-xs text-slate-400 font-medium">Daily Calories</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">{totalCalories}</span>
            <span className="text-xs text-slate-500">/ {targetCalories} kcal</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, (totalCalories / targetCalories) * 100)}%` }}
            />
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-medium">Protein</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-400">{totalProtein}g</span>
            <span className="text-xs text-slate-500">/ {targetProtein}g</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%` }}
            />
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-medium">Carbohydrates</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-amber-400">{totalCarbs}g</span>
            <span className="text-xs text-slate-500">/ {targetCarbs}g</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${Math.min(100, (totalCarbs / targetCarbs) * 100)}%` }}
            />
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-medium">Fats</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-rose-400">{totalFat}g</span>
            <span className="text-xs text-slate-500">/ {targetFat}g</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
            <div
              className="h-full bg-rose-400 rounded-full"
              style={{ width: `${Math.min(100, (totalFat / targetFat) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Meals Grouped by Type */}
      <div className="space-y-4">
        {meals.map((mealType) => {
          const mealLogs = logs.filter((l) => l.mealType === mealType);
          const mealCalories = mealLogs.reduce((s, l) => s + l.calories, 0);

          return (
            <div key={mealType} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wider">{mealType}</h3>
                  <span className="text-xs text-slate-400">({mealCalories} kcal)</span>
                </div>
                <button
                  onClick={() => openCreateModal(mealType)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Food
                </button>
              </div>

              {mealLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 italic">No foods logged for {mealType.toLowerCase()}.</p>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {mealLogs.map((log) => (
                    <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-200">{log.foodName}</p>
                        <p className="text-[11px] text-slate-400">
                          {log.servingSize}{log.servingUnit} • {log.proteinG}g P • {log.carbsG}g C • {log.fatG}g F
                          {log.notes && ` • "${log.notes}"`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white text-xs">{log.calories} kcal</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(log)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(log.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Favorite Foods Section with CRUD */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            <h3 className="text-base font-bold text-white">Favorite & Quick-Add Foods</h3>
          </div>
          <button
            onClick={() => {
              setEditingFavId(null);
              setFavFormData({
                name: '',
                brand: '',
                calories: 120,
                proteinG: 24,
                carbsG: 2,
                fatG: 1,
                fiberG: 0,
                defaultServing: 30,
                servingUnit: 'g',
                isFavorite: true,
              });
              setIsFavModalOpen(true);
            }}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Favorite Food
          </button>
        </div>

        {favoriteFoods.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 italic">No favorite foods saved yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteFoods.map((fav) => (
              <div
                key={fav.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-xs text-white">{fav.name}</p>
                    <span className="text-[10px] text-emerald-400 font-bold">{fav.calories} kcal</span>
                  </div>
                  {fav.brand && <p className="text-[10px] text-slate-500">{fav.brand}</p>}
                  <p className="text-[11px] text-slate-400 mt-1">
                    {fav.proteinG}g P • {fav.carbsG}g C • {fav.fatG}g F ({fav.defaultServing}{fav.servingUnit})
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800">
                  <button
                    onClick={() => logFavoriteFood(fav)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition"
                  >
                    + Log to Today
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingFavId(fav.id);
                        setFavFormData({
                          name: fav.name,
                          brand: fav.brand || '',
                          calories: fav.calories,
                          proteinG: fav.proteinG,
                          carbsG: fav.carbsG,
                          fatG: fav.fatG,
                          fiberG: fav.fiberG || 0,
                          defaultServing: fav.defaultServing,
                          servingUnit: fav.servingUnit || 'g',
                          isFavorite: fav.isFavorite,
                        });
                        setIsFavModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-400"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteFavTargetId(fav.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Food Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Food Entry' : 'Log Food Entry'}
        description="Enter macronutrients and meal time. Saves directly to PostgreSQL."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Food Name</label>
            <input
              type="text"
              required
              value={formData.foodName}
              onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              placeholder="e.g. Oatmeal with Whey & Berries"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Meal Type</label>
              <select
                value={formData.mealType}
                onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              >
                <option value="BREAKFAST">BREAKFAST</option>
                <option value="LUNCH">LUNCH</option>
                <option value="DINNER">DINNER</option>
                <option value="SNACK">SNACK</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Calories (kcal)</label>
              <input
                type="number"
                required
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Protein (g)</label>
              <input
                type="number"
                value={formData.proteinG}
                onChange={(e) => setFormData({ ...formData, proteinG: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={formData.carbsG}
                onChange={(e) => setFormData({ ...formData, carbsG: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fat (g)</label>
              <input
                type="number"
                value={formData.fatG}
                onChange={(e) => setFormData({ ...formData, fatG: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Serving Size</label>
              <input
                type="number"
                value={formData.servingSize}
                onChange={(e) => setFormData({ ...formData, servingSize: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Serving Unit</label>
              <input
                type="text"
                value={formData.servingUnit}
                onChange={(e) => setFormData({ ...formData, servingUnit: e.target.value })}
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
              placeholder="e.g. Post-workout breakfast"
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
              {editingId ? 'Save Changes' : 'Log Food'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Favorite Food Modal */}
      <Modal
        isOpen={isFavModalOpen}
        onClose={() => setIsFavModalOpen(false)}
        title={editingFavId ? 'Edit Favorite Food' : 'Add Favorite Food'}
        description="Save your go-to meals and snacks for single-click logging."
      >
        <form onSubmit={handleFavSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Food / Brand Name</label>
            <input
              type="text"
              required
              value={favFormData.name}
              onChange={(e) => setFavFormData({ ...favFormData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              placeholder="e.g. Greek Yogurt 0% Fat"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Brand (optional)</label>
              <input
                type="text"
                value={favFormData.brand}
                onChange={(e) => setFavFormData({ ...favFormData, brand: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
                placeholder="e.g. Fage"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Calories</label>
              <input
                type="number"
                required
                value={favFormData.calories}
                onChange={(e) => setFavFormData({ ...favFormData, calories: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Protein (g)</label>
              <input
                type="number"
                value={favFormData.proteinG}
                onChange={(e) => setFavFormData({ ...favFormData, proteinG: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={favFormData.carbsG}
                onChange={(e) => setFavFormData({ ...favFormData, carbsG: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fat (g)</label>
              <input
                type="number"
                value={favFormData.fatG}
                onChange={(e) => setFavFormData({ ...favFormData, fatG: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFavModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
            >
              Save Favorite
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Food Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Food Entry"
        message="Are you sure you want to permanently delete this nutrition record from your database?"
      />

      {/* Delete Favorite Confirm */}
      <ConfirmDialog
        isOpen={!!deleteFavTargetId}
        onClose={() => setDeleteFavTargetId(null)}
        onConfirm={handleFavDelete}
        title="Remove Favorite Food"
        message="Are you sure you want to delete this favorite food from your saved library?"
      />
    </div>
  );
}
