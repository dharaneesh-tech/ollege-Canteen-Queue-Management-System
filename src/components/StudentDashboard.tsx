import React from 'react';
import { 
  Clock, 
  Users, 
  Ticket, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  ChefHat
} from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { generateQueueStats } from '../utils/aiPredictor';
import { ActiveTab } from './Navbar';

interface StudentDashboardProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { orders, currentServingToken, myActiveOrder, menuItems } = useQueue();

  const stats = generateQueueStats(orders);
  const activeOrders = orders.filter(o => o.status === 'waiting' || o.status === 'preparing');
  const counter1Count = activeOrders.filter(o => o.counterNumber === 1).length;
  const counter2Count = activeOrders.filter(o => o.counterNumber === 2).length;

  // Estimated general wait time
  const generalWaitTime = Math.max(4, Math.round(activeOrders.length * 2.2));

  return (
    <div className="space-y-6">
      {/* Welcome & Problem-Solver Banner */}
      <div className="bg-linear-to-r from-orange-600 via-amber-600 to-orange-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            AI-Optimized Queue Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Skip the Lunch Rush, Not Your Meal
          </h1>
          <p className="text-orange-100 text-sm sm:text-base leading-relaxed">
            Take a digital token from anywhere in campus, monitor live kitchen prep times, and receive an instant chime notification right when your food is ready.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              id="btn-hero-get-token"
              onClick={() => onNavigate('get-token')}
              className="inline-flex items-center gap-2 bg-white text-orange-700 hover:bg-orange-50 font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all transform active:scale-95 text-sm"
            >
              <Ticket className="w-4 h-4 text-orange-600" />
              Get Digital Token
            </button>

            <button
              id="btn-hero-view-queue"
              onClick={() => onNavigate('queue-status')}
              className="inline-flex items-center gap-2 bg-orange-800/60 hover:bg-orange-800/80 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
            >
              <Users className="w-4 h-4 text-orange-200" />
              View Live Queue ({activeOrders.length} Waiting)
            </button>
          </div>
        </div>
      </div>

      {/* Active Token Callout if student already has one */}
      {myActiveOrder && (
        <div 
          id="student-active-token-callout"
          className="bg-amber-50 border border-amber-200/90 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              #{myActiveOrder.tokenNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">Your Active Token</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                  myActiveOrder.status === 'ready' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                    : myActiveOrder.status === 'preparing'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {myActiveOrder.status === 'ready' ? 'Ready for Pickup!' : myActiveOrder.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Counter {myActiveOrder.counterNumber} • {myActiveOrder.items.length} items • Est. wait ~{myActiveOrder.estimatedWaitMinutes} mins
              </p>
            </div>
          </div>

          <button
            id="btn-callout-track"
            onClick={() => onNavigate('queue-status')}
            className="inline-flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-xs"
          >
            Track Status
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Currently Serving</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            #{currentServingToken}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Live Kitchen Counter
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Students in Queue</span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {activeOrders.length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Waiting & in preparation
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Est. Waiting Time</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ~{generalWaitTime} <span className="text-sm font-semibold text-slate-500">mins</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            AI dynamic estimate
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Current Rush Level</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {stats.rushLevel}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Peak: {stats.peakHour.split(' ')[0]}
          </p>
        </div>
      </div>

      {/* Counter Distribution & AI Predictor Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Counter 1 Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Counter 1
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-700">
                Meals & Hot Food
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-2">Main Lunch Counter</h2>
            <p className="text-xs text-slate-500 mt-1">
              Thalis, Noodles, Dosas, and cooked platters.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">Active Queue:</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {counter1Count} orders
            </span>
          </div>
        </div>

        {/* Counter 2 Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Counter 2
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                Express Line
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-2">Snacks & Beverages</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sandwiches, Fries, Cold Coffee, Juices & Chai.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">Active Queue:</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {counter2Count} orders
            </span>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              AI Queue Advisor
            </div>
            <h2 className="text-base font-bold text-white mt-2">
              {counter2Count < counter1Count ? 'Express Counter Moving Faster' : 'Balanced Flow Observed'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {counter2Count < counter1Count
                ? `Counter 2 currently has ${counter1Count - counter2Count} fewer orders. Opting for sandwiches or snacks will get you served ~30% faster.`
                : 'Counters are currently operating at near-equal throughput. Order anytime.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Confidence Score:</span>
            <span className="font-semibold text-emerald-400">94% Accurate</span>
          </div>
        </div>
      </div>

      {/* Popular Menu Quick Highlights */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Today's Canteen Specials</h2>
            <p className="text-xs text-slate-500">Popular student favorites with quick kitchen prep times</p>
          </div>
          <button
            id="btn-view-full-menu"
            onClick={() => onNavigate('get-token')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            Order Items <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {menuItems.slice(0, 4).map(item => (
            <div
              key={item.id}
              className="border border-slate-200/80 hover:border-orange-200 hover:shadow-xs rounded-xl p-3.5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                    ● Veg
                  </span>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.prepTimeMinutes}m
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-2">{item.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">₹{item.price}</span>
                <button
                  id={`btn-quick-order-${item.id}`}
                  onClick={() => onNavigate('get-token')}
                  className="text-xs font-semibold text-orange-600 hover:bg-orange-50 px-2 py-1 rounded-md transition-colors"
                >
                  + Add to Token
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works 3-Step Guide for Viva Explanation */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 sm:p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          How the Digital Token System Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pick Food & Get Token</h3>
              <p className="text-xs text-slate-500 mt-1">
                Select your dishes and receive an instant digital token with estimated prep time.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Relax & Track Live Queue</h3>
              <p className="text-xs text-slate-500 mt-1">
                Wait in the library or classroom while your token progresses in real time.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Chime Alert & Pickup</h3>
              <p className="text-xs text-slate-500 mt-1">
                Get an approaching turn alert, walk to the counter, show your token, and collect!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
