import React from 'react';
import { 
  BarChart3, 
  Clock, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  Users, 
  DollarSign, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { generateQueueStats } from '../utils/aiPredictor';

export const Statistics: React.FC = () => {
  const { orders } = useQueue();

  const stats = generateQueueStats(orders);

  // Revenue calculation
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Completed rate
  const completionRate = orders.length > 0 
    ? Math.round((stats.completedOrdersCount / orders.length) * 100) 
    : 100;

  // Maximum order count for relative bar chart heights
  const maxHourlyOrders = Math.max(...stats.hourlyData.map(d => d.orders), 100);

  // Category counts
  const categorySales: { [cat: string]: number } = {
    'Meals': 42,
    'Snacks': 36,
    'Beverages': 28,
    'Quick Bites': 21
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-100 text-sky-800">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Canteen Queue Analytics & Statistics
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Performance metrics, peak hour patterns, and throughput optimization insights.
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live System Telemetry Active
          </div>
        </div>
      </div>

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Avg. Wait Time
            </span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.avgWaitTimeMinutes} <span className="text-sm font-medium text-slate-500">mins</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 18% lower than physical queue
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Peak Hours
            </span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900">
            12:30 - 1:30 PM
          </div>
          <p className="text-xs text-rose-600 font-medium mt-1">
            Max volume ~95 students/hr
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Revenue
            </span>
            <span className="font-bold text-slate-400 text-sm">₹</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{totalRevenue}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Across {orders.length} digital tokens
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Fulfillment Rate
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {completionRate}%
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {stats.completedOrdersCount} orders fulfilled
          </p>
        </div>
      </div>

      {/* Peak Hours Hourly Distribution Visual Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              Hourly Customer Traffic & Average Wait Times
            </h2>
            <p className="text-xs text-slate-500">
              Visualizing order spikes during breakfast, lunch, and evening recess
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-orange-500 inline-block" /> Order Volume
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Avg Wait (mins)
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3 items-end h-56">
            {stats.hourlyData.map(item => {
              const heightPercent = Math.round((item.orders / maxHourlyOrders) * 100);
              const isPeak = item.orders >= 75;

              return (
                <div key={item.hour} className="flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="text-[10px] font-bold text-slate-700 opacity-80 group-hover:opacity-100 transition-opacity mb-1">
                    {item.orders}
                  </div>

                  {/* The bar */}
                  <div className="w-full bg-slate-100 rounded-t-lg relative flex items-end h-40">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all ${
                        isPeak 
                          ? 'bg-linear-to-t from-orange-600 to-amber-500 shadow-xs' 
                          : 'bg-linear-to-t from-orange-400 to-orange-300'
                      }`}
                    />
                  </div>

                  {/* Wait label */}
                  <span className="text-[10px] font-semibold text-slate-500 mt-2">
                    {item.avgWait}m wait
                  </span>

                  {/* Hour label */}
                  <span className="text-[10px] font-medium text-slate-700 truncate w-full text-center mt-0.5">
                    {item.hour.replace(':00', '')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2-Column: Category Breakdown & AI Bottleneck Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Category breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="font-bold text-slate-900 text-base">Popular Item Categories</h2>

          <div className="space-y-3">
            {Object.entries(categorySales).map(([cat, percentage]) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{cat}</span>
                  <span className="text-slate-900">{percentage}% of orders</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Bottleneck & Viva Analysis */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Sparkles className="w-4 h-4" />
            AI Optimization Recommendations
          </div>
          <h2 className="font-bold text-base text-white">
            Queue Optimization & Kitchen Staffing Advice
          </h2>

          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <span>
                <strong className="text-white">Shift Express Orders:</strong> Moving cold coffee and sandwiches exclusively to Counter 2 decreases peak wait time at Counter 1 by <strong>32%</strong>.
              </span>
            </li>

            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <span>
                <strong className="text-white">Pre-portioning for 12:30 PM:</strong> Thali meal orders spike by 4x between 12:30 PM and 1:30 PM. Pre-plating basic sides reduces serving cycle to <strong>1.5 mins</strong>.
              </span>
            </li>

            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <span>
                <strong className="text-white">Digital Token Adoption:</strong> Contactless tokens eliminated physical line overcrowding in the dining hall by <strong>74%</strong>.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
