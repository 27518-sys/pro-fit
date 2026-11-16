'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  currentUserName: string;
  switchUser: (id: string, name: string) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string>('demo-user-1');
  const [currentUserName, setCurrentUserName] = useState<string>('Alex Mercer');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('profit_user_id');
    const savedName = localStorage.getItem('profit_user_name');
    if (saved) setCurrentUserId(saved);
    if (savedName) setCurrentUserName(savedName);
  }, []);

  const switchUser = (id: string, name: string) => {
    setCurrentUserId(id);
    setCurrentUserName(name);
    localStorage.setItem('profit_user_id', id);
    localStorage.setItem('profit_user_name', name);
    showToast(`Switched active session to ${name}`, 'info');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    headers.set('x-user-id', currentUserId);
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }
    return fetch(url, { ...options, headers });
  };

  return (
    <AppContext.Provider
      value={{
        currentUserId,
        setCurrentUserId,
        currentUserName,
        switchUser,
        toasts,
        showToast,
        removeToast,
        fetchWithAuth,
      }}
    >
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-lg shadow-xl border text-sm font-medium transition-all transform duration-300 animate-slide-up ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/50'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-700/50'
                : 'bg-slate-900/90 text-cyan-200 border-cyan-800/50'
            }`}
          >
            <span className="flex-1 pr-2">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100 text-xs px-1.5 py-0.5 rounded bg-black/30"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
