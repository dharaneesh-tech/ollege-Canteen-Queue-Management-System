import React from 'react';
import { 
  UtensilsCrossed, 
  Users, 
  Ticket, 
  Activity, 
  ShieldCheck, 
  BarChart3, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Sparkles,
  Radio
} from 'lucide-react';
import { useQueue } from '../context/QueueContext';

export type ActiveTab = 'student-dashboard' | 'get-token' | 'queue-status' | 'admin-dashboard' | 'statistics' | 'viva-guide';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    currentServingToken, 
    orders, 
    myActiveOrder, 
    soundEnabled, 
    setSoundEnabled, 
    resetQueue,
    simulationActive,
    setSimulationActive
  } = useQueue();

  const activeWaitingCount = orders.filter(o => o.status === 'waiting' || o.status === 'preparing').length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top utility row */}
        <div className="flex items-center justify-between h-16 border-b border-slate-100 py-2">
          {/* Logo & title */}
          <div 
            id="brand-logo-button"
            onClick={() => setActiveTab('student-dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  CampusDine
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3 text-orange-600" /> AI Queue
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                College Canteen Smart Queue System
              </p>
            </div>
          </div>

          {/* Center Quick Live Indicators */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-xs">
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" /> Serving:
              </span>
              <span className="font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded text-xs">
                #{currentServingToken}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 hidden md:flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">In Queue:</span>
              <span className="font-bold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded text-xs">
                {activeWaitingCount} students
              </span>
            </div>

            {myActiveOrder && (
              <button
                id="btn-nav-my-token-badge"
                onClick={() => setActiveTab('queue-status')}
                className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition-colors"
                title="View your active token"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>My Token #{myActiveOrder.tokenNumber}</span>
              </button>
            )}

            {/* Sound toggle */}
            <button
              id="btn-sound-toggle"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'border-slate-200 text-slate-400 hover:bg-slate-100'
              }`}
              title={soundEnabled ? 'Chime sound enabled (Click to mute)' : 'Sound muted (Click to unmute)'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Simulation toggle */}
            <button
              id="btn-simulation-toggle"
              onClick={() => setSimulationActive(!simulationActive)}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors ${
                simulationActive 
                  ? 'bg-blue-50 border-blue-200 text-blue-700 animate-pulse' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Auto-simulates queue progression for live demo"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{simulationActive ? 'Simulating' : 'Simulate'}</span>
            </button>

            {/* Reset data */}
            <button
              id="btn-reset-queue"
              onClick={() => {
                if (window.confirm('Reset queue to initial demo state?')) {
                  resetQueue();
                }
              }}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Reset queue data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto scrollbar-none">
          <button
            id="tab-student-dashboard"
            onClick={() => setActiveTab('student-dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'student-dashboard'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Dashboard</span>
          </button>

          <button
            id="tab-get-token"
            onClick={() => setActiveTab('get-token')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'get-token'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Get Token</span>
          </button>

          <button
            id="tab-queue-status"
            onClick={() => setActiveTab('queue-status')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'queue-status'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Queue Status</span>
          </button>

          <div className="h-5 w-px bg-slate-200 self-center mx-1" />

          <button
            id="tab-admin-dashboard"
            onClick={() => setActiveTab('admin-dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'admin-dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Admin / Staff</span>
          </button>

          <button
            id="tab-statistics"
            onClick={() => setActiveTab('statistics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'statistics'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Statistics</span>
          </button>

          <button
            id="tab-viva-guide"
            onClick={() => setActiveTab('viva-guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'viva-guide'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Viva & Docs</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
