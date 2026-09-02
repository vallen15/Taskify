import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { CategoriesView } from './components/CategoriesView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView onNavigateToTasks={() => setActiveTab('tasks')} />
        )}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'categories' && <CategoriesView />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Taskify - Todo & Productivity Management App</p>
          <p className="font-mono text-slate-400">Powered by Bun + Elysia.js + React + PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
