import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  TrendingUp,
  FolderKanban,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DashboardData } from '../types';
import { api } from '../services/api';

export const DashboardView: React.FC<{ onNavigateToTasks: () => void }> = ({ onNavigateToTasks }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      setData(res);
    } catch (err: any) {
      console.error('Gagal memuat dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-emerald-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-medium text-slate-700">Memuat dashboard produktivitas...</span>
        </div>
      </div>
    );
  }

  const { summary, weeklyProgressChart, recentTasks, overdueWarningList } = data || {
    summary: { totalTasks: 0, completedTasks: 0, pendingTasks: 0, inProgressTasks: 0, overdueTasks: 0, completionRate: 0, totalCategories: 0 },
    weeklyProgressChart: [],
    recentTasks: [],
    overdueWarningList: [],
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Produktivitas</h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau tingkat penyelesaian tugas, tenggat waktu, dan performa harian Anda.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onNavigateToTasks}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tingkat Selesai</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{summary.completionRate}%</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">{summary.completedTasks} dari {summary.totalTasks} tugas selesai</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Tugas</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{summary.totalTasks}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ListTodo className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">{summary.totalCategories} kategori terdaftar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dalam Proses</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{summary.inProgressTasks + summary.pendingTasks}</h3>
            </div>
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">{summary.pendingTasks} belum dimulai</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lewat Tenggat</p>
              <h3 className={`text-3xl font-bold mt-1 ${summary.overdueTasks > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {summary.overdueTasks}
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${summary.overdueTasks > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">Perlu penanganan segera</p>
        </div>
      </div>

      {/* Chart & Recent Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Productivity Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Grafik Penyelesaian Tugas Harian</h2>
              <p className="text-xs text-slate-500">Perbandingan tugas dibuat vs selesai 7 hari terakhir</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgressChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="completed" name="Tugas Selesai" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overdue Warnings Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Peringatan Tenggat</h2>
              <span className="px-2.5 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                Overdue
              </span>
            </div>

            <div className="space-y-3">
              {overdueWarningList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  Tidak ada tugas yang melewati tenggat! 👍
                </div>
              ) : (
                overdueWarningList.map((t) => (
                  <div key={t.id} className="p-3 bg-red-50/60 border border-red-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-700 uppercase">{t.priority}</span>
                      <span className="text-[11px] text-red-600 font-semibold">Overdue</span>
                    </div>
                    <p className="font-semibold text-slate-900 text-sm line-clamp-1">{t.title}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
