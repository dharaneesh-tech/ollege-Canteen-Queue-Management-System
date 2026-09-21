import React, { useState } from 'react';
import { 
  Ticket, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  ChefHat, 
  Sparkles, 
  Volume2, 
  XCircle, 
  Search,
  ArrowRight,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { soundManager } from '../utils/sound';
import { ActiveTab } from './Navbar';

interface QueueStatusProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const QueueStatus: React.FC<QueueStatusProps> = ({ onNavigate }) => {
  const { 
    orders, 
    myActiveTokenId, 
    myActiveOrder, 
    currentServingToken, 
    cancelMyToken, 
    setMyActiveTokenId 
  } = useQueue();

  const [lookupTokenInput, setLookupTokenInput] = useState<string>('');
  const [lookupError, setLookupError] = useState<string>('');

  // Queue lists
  const waitingOrders = orders
    .filter(o => o.status === 'waiting')
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  const preparingOrders = orders
    .filter(o => o.status === 'preparing')
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  const readyOrders = orders
    .filter(o => o.status === 'ready')
    .sort((a, b) => (b.readyAt || 0) - (a.readyAt || 0));

  // If student has an active order, calculate their queue position
  let studentsAhead = 0;
  let isApproaching = false;
  let isReady = false;

  if (myActiveOrder) {
    if (myActiveOrder.status === 'ready') {
      isReady = true;
    } else {
      // Count all active orders at this counter that came before or are being prepared
      const earlierInCounter = orders.filter(
        o => 
          o.counterNumber === myActiveOrder.counterNumber &&
          (o.status === 'waiting' || o.status === 'preparing') &&
          o.tokenNumber < myActiveOrder.tokenNumber
      );
      studentsAhead = earlierInCounter.length;
      if (myActiveOrder.status === 'preparing' || studentsAhead <= 1) {
        isApproaching = true;
      }
    }
  }

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    const tokenNum = parseInt(lookupTokenInput.trim(), 10);
    if (isNaN(tokenNum)) {
      setLookupError('Please enter a valid numeric token number.');
      return;
    }

    const found = orders.find(o => o.tokenNumber === tokenNum);
    if (!found) {
      setLookupError(`Token #${tokenNum} was not found in today's records.`);
      return;
    }

    setMyActiveTokenId(found.id);
    setLookupTokenInput('');
  };

  const handleManualChimeTest = () => {
    soundManager.playApproachingChime();
  };

  return (
    <div className="space-y-6">
      {/* Header & Token Lookup Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Radio className="w-5 h-5 animate-pulse" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Live Canteen Queue Display
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time token tracker with automated sound alerts and counter status.
            </p>
          </div>

          {/* Quick Token Lookup */}
          <form onSubmit={handleLookup} className="flex items-center gap-2">
            <div className="relative">
              <input
                id="lookup-token-input"
                type="number"
                placeholder="Search token (e.g. 104)"
                value={lookupTokenInput}
                onChange={e => setLookupTokenInput(e.target.value)}
                className="w-48 sm:w-56 bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
            <button
              id="btn-lookup-token"
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors"
            >
              Track
            </button>
          </form>
        </div>

        {lookupError && (
          <p className="text-xs text-rose-600 mt-2 font-medium flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> {lookupError}
          </p>
        )}
      </div>

      {/* STUDENT'S PERSONAL ACTIVE TOKEN TRACKER (Hero Card) */}
      {myActiveOrder ? (
        <div 
          id="student-live-token-tracker-card"
          className={`border-2 rounded-2xl p-6 shadow-sm transition-all ${
            isReady 
              ? 'bg-emerald-50/90 border-emerald-400' 
              : isApproaching 
              ? 'bg-amber-50/90 border-amber-400' 
              : 'bg-white border-orange-300'
          }`}
        >
          {/* Top Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-2xl text-white flex flex-col items-center justify-center shadow-md font-black ${
                isReady ? 'bg-emerald-600' : isApproaching ? 'bg-amber-500 text-slate-950' : 'bg-orange-600'
              }`}>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Token</span>
                <span className="text-3xl font-extrabold leading-none">#{myActiveOrder.tokenNumber}</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-xl font-extrabold text-slate-900">
                    {isReady ? '🎉 Your Food is Ready!' : isApproaching ? '🔔 Turn Approaching!' : 'Order in Kitchen Pipeline'}
                  </span>
                  <button
                    onClick={handleManualChimeTest}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Play chime sound test"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 mt-1">
                  Issued for <span className="font-semibold text-slate-900">{myActiveOrder.studentName}</span> ({myActiveOrder.studentId}) • Pickup at <span className="font-bold text-orange-700">Counter {myActiveOrder.counterNumber}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {myActiveOrder.status === 'waiting' && (
                <button
                  id="btn-cancel-my-token"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this token?')) {
                      cancelMyToken(myActiveOrder.id);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel Order
                </button>
              )}

              <button
                id="btn-switch-track-another"
                onClick={() => setMyActiveTokenId(null)}
                className="text-xs text-slate-600 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                Track Another
              </button>
            </div>
          </div>

          {/* Approaching Turn Alert Banner */}
          {isApproaching && !isReady && (
            <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-amber-950 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-semibold">
                  Only {studentsAhead === 0 ? 'your order being prepared right now' : `${studentsAhead} student ahead`}! Please proceed near Counter {myActiveOrder.counterNumber}.
                </span>
              </div>
              <span className="font-bold text-amber-900 shrink-0">~2-3 mins remaining</span>
            </div>
          )}

          {isReady && (
            <div className="mt-4 p-3 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-emerald-950 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-semibold">
                  Please present Token #{myActiveOrder.tokenNumber} to Counter {myActiveOrder.counterNumber} staff to collect your tray.
                </span>
              </div>
              <span className="font-bold text-emerald-900 shrink-0">Ready at Counter</span>
            </div>
          )}

          {/* Stepper Progress Bar */}
          <div className="mt-6">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {/* Step 1 */}
              <div className="space-y-1.5">
                <div className="h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-emerald-800 text-[11px] block">1. Token Placed</span>
                <span className="text-[10px] text-slate-400 block">Logged</span>
              </div>

              {/* Step 2 */}
              <div className="space-y-1.5">
                <div className={`h-2 rounded-full ${
                  myActiveOrder.status !== 'waiting' ? 'bg-emerald-500' : 'bg-slate-200'
                }`} />
                <span className={`text-[11px] font-bold block ${
                  myActiveOrder.status !== 'waiting' ? 'text-emerald-800' : 'text-slate-500'
                }`}>
                  2. Preparing
                </span>
                <span className="text-[10px] text-slate-400 block">Kitchen Active</span>
              </div>

              {/* Step 3 */}
              <div className="space-y-1.5">
                <div className={`h-2 rounded-full ${
                  isApproaching || isReady || myActiveOrder.status === 'completed'
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`} />
                <span className={`text-[11px] font-bold block ${
                  isApproaching || isReady ? 'text-emerald-800' : 'text-slate-500'
                }`}>
                  3. Turn Next
                </span>
                <span className="text-[10px] text-slate-400 block">Standby</span>
              </div>

              {/* Step 4 */}
              <div className="space-y-1.5">
                <div className={`h-2 rounded-full ${
                  isReady || myActiveOrder.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                }`} />
                <span className={`text-[11px] font-bold block ${
                  isReady ? 'text-emerald-800 font-extrabold animate-pulse' : 'text-slate-500'
                }`}>
                  4. Ready / Pickup
                </span>
                <span className="text-[10px] text-slate-400 block">Counter {myActiveOrder.counterNumber}</span>
              </div>
            </div>
          </div>

          {/* Quick Details Metric Grid */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/80 border border-slate-200/60 rounded-xl p-3">
              <span className="text-[11px] text-slate-500 block font-medium">Students Ahead</span>
              <span className="text-lg font-bold text-slate-900">
                {isReady ? '0 (You are next!)' : `${studentsAhead} students`}
              </span>
            </div>

            <div className="bg-white/80 border border-slate-200/60 rounded-xl p-3">
              <span className="text-[11px] text-slate-500 block font-medium">Estimated Remaining</span>
              <span className="text-lg font-bold text-orange-700">
                {isReady ? 'Ready Now' : `~${Math.max(2, studentsAhead * 2.5)} mins`}
              </span>
            </div>

            <div className="bg-white/80 border border-slate-200/60 rounded-xl p-3">
              <span className="text-[11px] text-slate-500 block font-medium">Serving Counter</span>
              <span className="text-lg font-bold text-slate-900">
                Counter {myActiveOrder.counterNumber}
              </span>
            </div>

            <div className="bg-white/80 border border-slate-200/60 rounded-xl p-3">
              <span className="text-[11px] text-slate-500 block font-medium">Total Bill</span>
              <span className="text-lg font-bold text-slate-900">
                ₹{myActiveOrder.totalAmount}
              </span>
            </div>
          </div>

          {/* Items Summary in this token */}
          <div className="mt-4 text-xs text-slate-600 bg-white/60 rounded-lg p-2.5 flex items-center justify-between">
            <span className="font-semibold text-slate-700">Items Ordered:</span>
            <span className="truncate ml-2">
              {myActiveOrder.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
            </span>
          </div>
        </div>
      ) : (
        /* No active token selected banner */
        <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 mx-auto flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No Active Token Being Tracked</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            You don't have an active token tracked right now. Generate a new token or look up an existing token number above.
          </p>
          <div className="pt-2">
            <button
              id="btn-no-token-get-token"
              onClick={() => onNavigate('get-token')}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Ticket className="w-4 h-4" />
              Get New Token
            </button>
          </div>
        </div>
      )}

      {/* PUBLIC CANTEEN LIVE DISPLAY BOARD (Digital Signage) */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Digital Canteen Display Monitor
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              Now Serving & Kitchen Status
            </h2>
          </div>
          <div className="text-xs text-slate-400">
            Updated in real time • Auto-refreshed
          </div>
        </div>

        {/* 3 Pillars: Ready for Pickup | Currently Preparing | In Waiting Queue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Ready for Pickup */}
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <span className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Ready For Pickup
              </span>
              <span className="text-xs bg-emerald-900/80 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                {readyOrders.length}
              </span>
            </div>

            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
              {readyOrders.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-6 text-center">
                  No orders currently waiting for pickup
                </div>
              ) : (
                readyOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-emerald-900/50 border border-emerald-700/60 rounded-lg p-2.5 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-emerald-200 text-base">
                        #{order.tokenNumber}
                      </span>
                      <span className="text-[11px] text-emerald-400 block">
                        Counter {order.counterNumber} • {order.studentName}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-emerald-500 text-slate-950 px-2 py-1 rounded">
                      Collect
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. In Kitchen / Preparing */}
          <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-800/40">
              <span className="font-bold text-sm text-blue-400 flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-blue-400" />
                Kitchen Preparing
              </span>
              <span className="text-xs bg-blue-900/80 text-blue-300 font-bold px-2 py-0.5 rounded-full">
                {preparingOrders.length}
              </span>
            </div>

            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
              {preparingOrders.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-6 text-center">
                  Kitchen is awaiting next batch of tokens
                </div>
              ) : (
                preparingOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-blue-900/50 border border-blue-700/60 rounded-lg p-2.5 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-blue-200 text-base">
                        #{order.tokenNumber}
                      </span>
                      <span className="text-[11px] text-blue-300 block">
                        Counter {order.counterNumber} • {order.studentName}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-blue-300 bg-blue-950/80 px-2 py-1 rounded border border-blue-800">
                      Cooking
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Waiting in Queue */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Upcoming in Line
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">
                {waitingOrders.length}
              </span>
            </div>

            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
              {waitingOrders.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-6 text-center">
                  Queue is clear! Zero waiting orders.
                </div>
              ) : (
                waitingOrders.map((order, idx) => (
                  <div
                    key={order.id}
                    className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white">#{order.tokenNumber}</span>
                        <span className="text-[10px] text-slate-400">({order.studentName})</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        Counter {order.counterNumber} • ~{order.estimatedWaitMinutes}m
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                      #{idx + 1} in line
                    </span>
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
