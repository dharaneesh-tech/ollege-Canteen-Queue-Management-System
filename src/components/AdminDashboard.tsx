import React, { useState } from 'react';
import { 
  Users, 
  ChefHat, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Volume2, 
  Filter, 
  Search, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  AlertCircle,
  Megaphone
} from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { OrderItem, OrderStatus, TokenOrder } from '../types';
import { soundManager } from '../utils/sound';

export const AdminDashboard: React.FC = () => {
  const { 
    orders, 
    currentServingToken, 
    callNextToken, 
    updateTokenStatus, 
    setCurrentServingTokenManual,
    addWalkInOrder,
    menuItems 
  } = useQueue();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCounter, setFilterCounter] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [manualTokenInput, setManualTokenInput] = useState<string>('');
  
  // Walk-in order modal state
  const [showWalkInModal, setShowWalkInModal] = useState<boolean>(false);
  const [walkInName, setWalkInName] = useState<string>('Walk-In Student');
  const [walkInCounter, setWalkInCounter] = useState<number>(1);
  const [walkInCart, setWalkInCart] = useState<{ [id: string]: number }>({
    'item-5': 1, // default Samosa Pav
    'item-10': 1, // default Masala Chai
  });

  // Calculate quick metrics
  const waitingOrders = orders.filter(o => o.status === 'waiting');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => o.status === 'completed');

  // Filtered orders list
  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    if (filterCounter !== 'all' && order.counterNumber !== filterCounter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchToken = order.tokenNumber.toString().includes(q);
      const matchName = order.studentName.toLowerCase().includes(q);
      const matchId = order.studentId.toLowerCase().includes(q);
      return matchToken || matchName || matchId;
    }
    return true;
  });

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(manualTokenInput.trim(), 10);
    if (!isNaN(val)) {
      setCurrentServingTokenManual(val);
      soundManager.playApproachingChime();
      setManualTokenInput('');
    }
  };

  const handleCreateWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    const items: OrderItem[] = Object.entries(walkInCart)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = menuItems.find(m => m.id === id)!;
        return {
          menuItemId: item.id,
          name: item.name,
          quantity: qty,
          price: item.price,
          prepTimeMinutes: item.prepTimeMinutes,
        };
      });

    if (items.length === 0) {
      alert('Please add at least one item for the walk-in order.');
      return;
    }

    addWalkInOrder(walkInName.trim() || 'Walk-In Customer', items, walkInCounter);
    setShowWalkInModal(false);
    setWalkInCart({ 'item-5': 1, 'item-10': 1 });
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Controls & Counter Calling Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              Canteen Staff & Kitchen Operations
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Queue Dispatch Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Call tokens in sequence, broadcast ready chime notifications, and manage walk-ins.
            </p>
          </div>

          {/* Quick Counter Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-admin-call-counter-1"
              onClick={() => callNextToken(1)}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Megaphone className="w-4 h-4" />
              Call Next (Counter 1)
            </button>

            <button
              id="btn-admin-call-counter-2"
              onClick={() => callNextToken(2)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Megaphone className="w-4 h-4" />
              Call Next (Counter 2)
            </button>

            <button
              id="btn-admin-add-walkin"
              onClick={() => setShowWalkInModal(true)}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4 text-orange-400" />
              Add Walk-In Order
            </button>
          </div>
        </div>

        {/* Manual Token Number Override & Status Bar */}
        <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400">Current Token Serving:</div>
            <span className="text-2xl font-black text-amber-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
              #{currentServingToken}
            </span>
          </div>

          <form onSubmit={handleManualTokenSubmit} className="flex items-center gap-2">
            <label htmlFor="admin-manual-token-input" className="text-xs text-slate-400 whitespace-nowrap">
              Jump to Token #:
            </label>
            <input
              id="admin-manual-token-input"
              type="number"
              value={manualTokenInput}
              onChange={e => setManualTokenInput(e.target.value)}
              placeholder="e.g. 108"
              className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
            />
            <button
              id="btn-admin-manual-token-update"
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Set
            </button>
          </form>
        </div>
      </div>

      {/* 4 Operations KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setFilterStatus('waiting')}
          className={`cursor-pointer bg-white border rounded-xl p-4 shadow-xs transition-all ${
            filterStatus === 'waiting' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Waiting</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {waitingOrders.length}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Needs Kitchen Prep</span>
        </div>

        <div 
          onClick={() => setFilterStatus('preparing')}
          className={`cursor-pointer bg-white border rounded-xl p-4 shadow-xs transition-all ${
            filterStatus === 'preparing' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">In Preparation</span>
            <ChefHat className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {preparingOrders.length}
          </div>
          <span className="text-[11px] text-blue-700 font-medium">Cooking in Kitchen</span>
        </div>

        <div 
          onClick={() => setFilterStatus('ready')}
          className={`cursor-pointer bg-white border rounded-xl p-4 shadow-xs transition-all ${
            filterStatus === 'ready' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Ready for Pickup</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {readyOrders.length}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Students Notified</span>
        </div>

        <div 
          onClick={() => setFilterStatus('completed')}
          className={`cursor-pointer bg-white border rounded-xl p-4 shadow-xs transition-all ${
            filterStatus === 'completed' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Completed Today</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {completedOrders.length}
          </div>
          <span className="text-[11px] text-purple-700 font-medium">Served Successfully</span>
        </div>
      </div>

      {/* Orders Filter & Management List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'waiting', 'preparing', 'ready', 'completed'].map(st => (
              <button
                key={st}
                id={`admin-filter-status-${st}`}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st} {st === 'all' ? `(${orders.length})` : ''}
              </button>
            ))}
          </div>

          {/* Search & Counter selector */}
          <div className="flex items-center gap-2">
            <select
              id="admin-filter-counter-select"
              value={filterCounter}
              onChange={e => setFilterCounter(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Counters</option>
              <option value="1">Counter 1 (Meals)</option>
              <option value="2">Counter 2 (Snacks)</option>
            </select>

            <div className="relative">
              <input
                id="admin-search-orders-input"
                type="text"
                placeholder="Search token or student..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-44 sm:w-56 bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                <th className="py-2.5 px-3 font-semibold">Token</th>
                <th className="py-2.5 px-3 font-semibold">Student</th>
                <th className="py-2.5 px-3 font-semibold">Counter</th>
                <th className="py-2.5 px-3 font-semibold">Items & Total</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Kitchen Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-extrabold text-sm text-slate-900">
                      #{order.tokenNumber}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{order.studentName}</div>
                      <div className="text-[11px] text-slate-400">{order.studentId}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-[11px]">
                        Counter {order.counterNumber}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">
                        {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        ₹{order.totalAmount} • Est. {order.estimatedWaitMinutes}m
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          order.status === 'ready'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : order.status === 'preparing'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : order.status === 'waiting'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : order.status === 'completed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status === 'waiting' && (
                          <button
                            id={`btn-admin-prepare-${order.id}`}
                            onClick={() => updateTokenStatus(order.id, 'preparing')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-semibold shadow-2xs transition-colors"
                          >
                            Start Prep
                          </button>
                        )}

                        {order.status === 'preparing' && (
                          <button
                            id={`btn-admin-ready-${order.id}`}
                            onClick={() => {
                              updateTokenStatus(order.id, 'ready');
                              soundManager.playReadyChime();
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <Volume2 className="w-3 h-3" /> Mark Ready
                          </button>
                        )}

                        {order.status === 'ready' && (
                          <button
                            id={`btn-admin-complete-${order.id}`}
                            onClick={() => updateTokenStatus(order.id, 'completed')}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                          >
                            Complete
                          </button>
                        )}

                        {(order.status === 'waiting' || order.status === 'preparing') && (
                          <button
                            id={`btn-admin-cancel-${order.id}`}
                            onClick={() => {
                              if (window.confirm(`Cancel token #${order.tokenNumber}?`)) {
                                updateTokenStatus(order.id, 'cancelled');
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded transition-colors"
                            title="Cancel order"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Walk-In Order Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-600" />
                Add Walk-In / Cash Order
              </h3>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer / Student Name</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={e => setWalkInName(e.target.value)}
                  placeholder="e.g. Counter Cash Customer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign to Counter</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalkInCounter(1)}
                    className={`p-2 rounded-lg border font-bold text-center ${
                      walkInCounter === 1 ? 'border-orange-500 bg-orange-50 text-orange-900' : 'border-slate-200'
                    }`}
                  >
                    Counter 1 (Meals)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalkInCounter(2)}
                    className={`p-2 rounded-lg border font-bold text-center ${
                      walkInCounter === 2 ? 'border-orange-500 bg-orange-50 text-orange-900' : 'border-slate-200'
                    }`}
                  >
                    Counter 2 (Snacks)
                  </button>
                </div>
              </div>

              {/* Items list */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Items</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2">
                  {menuItems.map(item => {
                    const qty = walkInCart[item.id] || 0;
                    return (
                      <div key={item.id} className="flex items-center justify-between py-1 border-b border-slate-50">
                        <div>
                          <span className="font-semibold text-slate-800">{item.name}</span>
                          <span className="text-slate-400 ml-2">₹{item.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setWalkInCart(prev => ({ ...prev, [item.id]: Math.max(0, (prev[item.id] || 0) - 1) }));
                            }}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold">{qty}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setWalkInCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
                            }}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-lg"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
