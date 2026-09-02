import React, { useEffect, useState } from 'react';
import { FolderKanban, Plus, X, ListTodo } from 'lucide-react';
import { Category } from '../types';
import { api } from '../services/api';

export const CategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [color, setColor] = useState('#10b981');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getCategories();
      setCategories(res);
    } catch (err: any) {
      alert(`Gagal memuat kategori: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.createCategory({ name: name.trim(), color });
      setIsModalOpen(false);
      setName('');
      loadData();
    } catch (err: any) {
      alert(`Gagal menyimpan kategori: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kategori & Tag Tugas</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelompokkan tugas berdasarkan proyek, pekerjaan, atau topik khusus.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
          Memuat kategori...
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
          Belum ada kategori terdaftar.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: c.color }}
                  />
                  <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                </div>
                <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                  <FolderKanban className="w-5 h-5" />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Total Tugas</span>
                <span className="text-sm font-bold text-slate-900">{c.taskCount || 0} Tugas</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-lg font-bold text-slate-900">Tambah Kategori Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="Contoh: Belajar & Kuliah"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Warna Tag</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <span className="font-mono text-xs text-slate-600">{color}</span>
                </div>
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
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
