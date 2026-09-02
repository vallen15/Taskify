import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  Calendar,
  X,
  Filter,
} from 'lucide-react';
import { Task, Category, TaskPriority, TaskStatus } from '../types';
import { api } from '../services/api';

export const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    categoryId: string;
  }>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: '',
    categoryId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [taskRes, catRes] = await Promise.all([api.getTasks(), api.getCategories()]);
      setTasks(taskRes);
      setCategories(catRes);
    } catch (err: any) {
      alert(`Gagal memuat daftar tugas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: new Date().toISOString().split('T')[0],
      categoryId: categories[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      categoryId: task.categoryId || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, formData);
      } else {
        await api.createTask(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Gagal menyimpan tugas: ${err.message}`);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await api.updateTask(task.id, { isCompleted: !task.isCompleted });
      loadData();
    } catch (err: any) {
      alert(`Gagal memperbarui status tugas: ${err.message}`);
    }
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (!confirm(`Hapus tugas '${title}'?`)) return;
    try {
      await api.deleteTask(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'COMPLETED' && t.isCompleted) ||
      (selectedStatus === 'PENDING' && !t.isCompleted && t.status === 'PENDING') ||
      (selectedStatus === 'IN_PROGRESS' && !t.isCompleted && t.status === 'IN_PROGRESS');
    const matchesPriority = selectedPriority === 'ALL' || t.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'ALL' || t.categoryId === selectedCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Tugas & To-Do</h1>
          <p className="text-slate-500 text-sm mt-1">
            Daftar seluruh tugas, filter berdasarkan status/prioritas, dan jadwalkan jatuh tempo.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari judul atau deskripsi tugas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Tertunda (Pending)</option>
            <option value="IN_PROGRESS">Dalam Proses (In Progress)</option>
            <option value="COMPLETED">Selesai (Completed)</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="URGENT">Urgent (Darurat)</option>
            <option value="HIGH">High (Tinggi)</option>
            <option value="MEDIUM">Medium (Sedang)</option>
            <option value="LOW">Low (Rendah)</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List Cards */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
          Memuat tugas...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
          Tidak ada tugas ditemukan.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`bg-white p-4 rounded-2xl border transition-all shadow-sm flex items-start justify-between gap-4 ${
                t.isCompleted
                  ? 'border-slate-200 bg-slate-50/50 opacity-75'
                  : t.isOverdue
                  ? 'border-red-200 bg-red-50/20'
                  : 'border-slate-200 hover:border-emerald-500'
              }`}
            >
              {/* Checkbox & Task details */}
              <div className="flex items-start space-x-3 flex-1">
                <button
                  onClick={() => handleToggleComplete(t)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-600 transition"
                >
                  {t.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`font-semibold text-slate-900 text-sm ${
                        t.isCompleted ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {t.title}
                    </h3>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getPriorityBadge(
                        t.priority
                      )}`}
                    >
                      {t.priority}
                    </span>

                    {t.category && (
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold rounded-md text-white"
                        style={{ backgroundColor: t.category.color }}
                      >
                        {t.category.name}
                      </span>
                    )}

                    {t.isOverdue && !t.isCompleted && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-100 text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Overdue
                      </span>
                    )}
                  </div>

                  {t.description && <p className="text-xs text-slate-500">{t.description}</p>}

                  {t.dueDate && (
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 pt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Jatuh Tempo: {new Date(t.dueDate).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleOpenEditModal(t)}
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTask(t.id, t.title)}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTask ? 'Edit Tugas' : 'Buat Tugas Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Tugas *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="Contoh: Menyusun Slide Presentasi Projek"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Detail</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioritas *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="LOW">Rendah (Low)</option>
                    <option value="MEDIUM">Sedang (Medium)</option>
                    <option value="HIGH">Tinggi (High)</option>
                    <option value="URGENT">Urgent (Darurat)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori / Tag</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Tanpa Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Jatuh Tempo</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
