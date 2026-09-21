import React, { useState } from 'react';
import { 
  FolderTree, 
  Terminal, 
  HelpCircle, 
  Code2, 
  Copy, 
  Check, 
  BookOpen, 
  Sparkles, 
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';

export const VivaGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'structure' | 'install' | 'viva-qa' | 'architecture'>('viva-qa');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const folderStructureText = `college-canteen-queue/
├── index.html                   # Entry HTML file
├── package.json                 # Project dependencies & scripts
├── vite.config.ts               # Vite configuration
├── metadata.json                # Project identity metadata
└── src/
    ├── main.tsx                 # React DOM root render
    ├── App.tsx                  # Root app component & navigation state
    ├── index.css                # Global CSS & Tailwind styling
    ├── types.ts                 # TypeScript interfaces (Order, MenuItem, Stats)
    ├── context/
    │   └── QueueContext.tsx     # Central React Context (localStorage persistence)
    ├── utils/
    │   ├── initialData.ts       # Seeded canteen dishes & initial queue data
    │   ├── aiPredictor.ts       # AI wait time prediction & analytics algorithm
    │   └── sound.ts             # Web Audio API chime sound synthesizer
    └── components/
        ├── Navbar.tsx           # Responsive header with live serving ticker
        ├── NotificationBanner.tsx # In-app approaching turn / ready banner
        ├── StudentDashboard.tsx # Queue length, wait time, canteen specials
        ├── GetToken.tsx         # Digital token generation & dish selection
        ├── QueueStatus.tsx      # Live token tracker, stepper, & display board
        ├── AdminDashboard.tsx   # Staff order dispatch console & manual token jump
        ├── Statistics.tsx       # Average wait, peak hour visual chart & analytics
        └── VivaGuide.tsx        # Project docs, viva Q&A, and run instructions`;

  const installCommands = `# Step 1: Clone or extract the project files
git clone <repo-url>
cd college-canteen-queue

# Step 2: Install dependencies
npm install

# Step 3: Run development server
npm run dev

# (Alternatively for production build)
npm run build
npm run preview`;

  const vivaQuestions = [
    {
      q: '1. What problem does this College Canteen Queue System solve?',
      a: 'During peak lunch hours (12:30 PM - 1:30 PM), college canteens suffer from heavy overcrowding, physical standing lines, and lost classroom/library study time. This system replaces physical queues with digital tokens, provides real-time wait time estimates, and notifies students via audio chimes when their order is ready so they only approach the counter when needed.',
    },
    {
      q: '2. Which React Hooks did you use, and why?',
      a: '• useState: Manages active tab, selected menu items, student inputs, and filtering.\n• useEffect: Synchronizes queue orders with localStorage, tracks order status changes to trigger turn-approaching chimes, and handles the auto-simulation timer.\n• useContext (createContext / useQueue): Provides a single source of truth for queue data across Student Dashboard, Get Token, Queue Status, and Admin Dashboard without prop drilling.\n• useCallback: Memoizes queue dispatch actions (takeToken, callNextToken, updateStatus) for performance.',
    },
    {
      q: '3. How is queue data persisted without a backend server?',
      a: 'The system uses browser localStorage (under keys like "college_canteen_orders_v1" and "college_canteen_my_active_token_v1"). Whenever any order is created or its status changes, an effect serializes the state to JSON and writes it to localStorage. On page reload, the state initializes from localStorage with graceful fallback to seeded mock data.',
    },
    {
      q: '4. How does the AI Wait Time Predictor work?',
      a: 'The algorithm combines four parameters:\n1. Base Preparation Time: Computed from the highest cooking time among selected dishes plus a partial parallelism multiplier for extra items.\n2. Active Queue Backlog: Counts orders currently waiting or being prepared at the assigned counter (~2.5 mins per waiting order).\n3. Time-of-Day Rush Multiplier: Dynamically factors lunch rush (12:00 PM - 2:00 PM = 1.35x), morning tea break (1.2x), and evening recess (1.25x).\n4. Kitchen Parallelism: Recommends Counter 2 if Counter 1 is congested.',
    },
    {
      q: '5. How are the sound notifications generated without external audio files?',
      a: 'Using the standard browser Web Audio API (AudioContext, OscillatorNode, and GainNode). We synthesize pleasant musical chimes (sine and triangle waves) for "Turn Approaching" (two-tone E5-G#5) and "Food Ready" (four-tone C5-E5-G5-C6 arpeggio). This eliminates network audio loading latency and 404 file errors.',
    },
    {
      q: '6. How would you scale this system to production for the whole college?',
      a: 'For production:\n1. Replace localStorage with a real-time database (e.g., Firebase Firestore or PostgreSQL + WebSockets/Socket.io) so state syncs across multiple students\' mobile phones instantly.\n2. Add College Roll Number authentication (OAuth or Student SSO).\n3. Integrate online campus UPI / Razorpay payment gateway for prepaid digital orders.\n4. Connect to physical digital LED monitors mounted over canteen pickup counters.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-purple-900 text-white rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Academic Project & Viva Voce Guide
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Project Architecture & Viva Examiner Q&A
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-1">
              Complete folder structure, installation commands, React concepts, and examiner questions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-800/80 text-purple-200 border border-purple-700">
              Exam & Viva Ready
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          id="btn-viva-tab-qa"
          onClick={() => setActiveSection('viva-qa')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeSection === 'viva-qa'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Viva Questions & Answers
        </button>

        <button
          id="btn-viva-tab-structure"
          onClick={() => setActiveSection('structure')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeSection === 'structure'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderTree className="w-4 h-4" /> Project Folder Structure
        </button>

        <button
          id="btn-viva-tab-install"
          onClick={() => setActiveSection('install')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeSection === 'install'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-4 h-4" /> Run & Installation Commands
        </button>

        <button
          id="btn-viva-tab-architecture"
          onClick={() => setActiveSection('architecture')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeSection === 'architecture'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" /> System Flow & Algorithm
        </button>
      </div>

      {/* TAB 1: VIVA QUESTIONS & ANSWERS */}
      {activeSection === 'viva-qa' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <p className="text-xs text-slate-600">
              💡 <strong>Tip for Viva:</strong> Examiners typically ask about the practical problem, React hooks usage, data persistence strategy, and how the wait time is calculated. Review these concise answers below:
            </p>
          </div>

          <div className="space-y-3">
            {vivaQuestions.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-purple-300 transition-colors"
              >
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-start gap-2">
                  <span className="p-1 rounded-md bg-purple-50 text-purple-700 font-extrabold text-xs">
                    Q{idx + 1}
                  </span>
                  <span>{item.q.replace(/^\d+\.\s*/, '')}</span>
                </h3>
                <div className="mt-3 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/70 p-3.5 rounded-lg border border-slate-100">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: FOLDER STRUCTURE */}
      {activeSection === 'structure' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Complete Project File Tree</h2>
              <p className="text-xs text-slate-500">Modular structure separating Context, Components, Utils, and Types</p>
            </div>
            <button
              onClick={() => copyToClipboard(folderStructureText, 'structure')}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              {copiedKey === 'structure' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'structure' ? 'Copied!' : 'Copy Tree'}
            </button>
          </div>

          <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
            {folderStructureText}
          </pre>
        </div>
      )}

      {/* TAB 3: RUN & INSTALL COMMANDS */}
      {activeSection === 'install' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">How to Install and Run</h2>
              <p className="text-xs text-slate-500">Run locally on your laptop using Node.js and npm</p>
            </div>
            <button
              onClick={() => copyToClipboard(installCommands, 'commands')}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              {copiedKey === 'commands' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'commands' ? 'Copied!' : 'Copy Commands'}
            </button>
          </div>

          <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
            {installCommands}
          </pre>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-2">
            <h3 className="font-bold text-sm">Prerequisites:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Node.js (version 18 or above recommended)</li>
              <li>npm (included automatically with Node.js)</li>
              <li>Modern web browser (Chrome, Edge, Firefox, Safari) with JavaScript enabled</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 4: ARCHITECTURE & ALGORITHM */}
      {activeSection === 'architecture' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Queue Processing Architecture</h2>
            <p className="text-xs text-slate-500">How data moves between Student Portal, Central Storage, and Kitchen Dispatch</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> 1. Student Client
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Student adds items to cart and triggers <code>takeToken()</code>. The system calculates base cooking duration, reads current queue backlog at the preferred counter, and generates a sequential token number.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> 2. Queue State Machine
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Each token progresses through states:
                <br />
                <strong>waiting</strong> ➔ <strong>preparing</strong> ➔ <strong>ready</strong> ➔ <strong>completed</strong>.
                State transitions automatically synchronize with localStorage.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> 3. Sound & Alert Engine
              </h3>
              <p className="text-slate-600 leading-relaxed">
                When a student's token approaches (≤1 order ahead) or is marked "ready", the Web Audio chime triggers immediately and the in-app alert banner guides the student to the pickup counter.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
