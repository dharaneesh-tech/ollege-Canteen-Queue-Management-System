import React, { useState } from 'react';
import { QueueProvider } from './context/QueueContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { NotificationBanner } from './components/NotificationBanner';
import { StudentDashboard } from './components/StudentDashboard';
import { GetToken } from './components/GetToken';
import { QueueStatus } from './components/QueueStatus';
import { AdminDashboard } from './components/AdminDashboard';
import { Statistics } from './components/Statistics';
import { VivaGuide } from './components/VivaGuide';
import { Utensils, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('student-dashboard');

  return (
    <QueueProvider>
      <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
        {/* Approaching Turn / Ready Alert Banner */}
        <NotificationBanner />

        {/* Top Navbar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {activeTab === 'student-dashboard' && (
            <StudentDashboard onNavigate={setActiveTab} />
          )}

          {activeTab === 'get-token' && (
            <GetToken onNavigate={setActiveTab} />
          )}

          {activeTab === 'queue-status' && (
            <QueueStatus onNavigate={setActiveTab} />
          )}

          {activeTab === 'admin-dashboard' && (
            <AdminDashboard />
          )}

          {activeTab === 'statistics' && (
            <Statistics />
          )}

          {activeTab === 'viva-guide' && (
            <VivaGuide />
          )}
        </main>

        {/* Clean Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-orange-600 text-white flex items-center justify-center">
                <Utensils className="w-3 h-3" />
              </div>
              <span className="font-semibold text-slate-800">
                CampusDine Smart Canteen Queue
              </span>
              <span>• College Project Edition</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('student-dashboard')}
                className="hover:text-slate-800 transition-colors"
              >
                Student View
              </button>
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className="hover:text-slate-800 transition-colors"
              >
                Staff Console
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className="hover:text-slate-800 transition-colors"
              >
                Statistics
              </button>
              <button
                onClick={() => setActiveTab('viva-guide')}
                className="text-purple-600 font-semibold hover:text-purple-800 transition-colors"
              >
                Viva Guide & Docs
              </button>
            </div>
          </div>
        </footer>
      </div>
    </QueueProvider>
  );
}
