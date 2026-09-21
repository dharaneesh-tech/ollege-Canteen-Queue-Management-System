import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  ShoppingBag, 
  Clock, 
  Sparkles, 
  User, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  ArrowRight,
  Utensils
} from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { MenuItem, OrderItem, TokenOrder } from '../types';
import { calculateEstimatedWait } from '../utils/aiPredictor';
import { ActiveTab } from './Navbar';

interface GetTokenProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const GetToken: React.FC<GetTokenProps> = ({ onNavigate }) => {
  const { menuItems, orders, takeToken } = useQueue();

  // Selected items map: { itemId: quantity }
  const [cart, setCart] = useState<{ [id: string]: number }>({
    'item-2': 1, // default 1 Masala Dosa
    'item-10': 1, // default 1 Masala Chai
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [studentName, setStudentName] = useState<string>('Alex Johnson');
  const [studentId, setStudentId] = useState<string>('CS-2024-055');
  const [counterNumber, setCounterNumber] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  // Generated token state for success view
  const [generatedOrder, setGeneratedOrder] = useState<TokenOrder | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Categories
  const categories = ['All', 'Meals', 'Snacks', 'Beverages', 'Quick Bites'];

  const filteredMenuItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(i => i.category === selectedCategory);

  // Build cart order items
  const orderItems: OrderItem[] = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([itemId, qty]) => {
      const item = menuItems.find(m => m.id === itemId)!;
      return {
        menuItemId: item.id,
        name: item.name,
        quantity: qty,
        price: item.price,
        prepTimeMinutes: item.prepTimeMinutes,
      };
    });

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate live dynamic AI wait time
  const aiPrediction = calculateEstimatedWait(orderItems, orders, counterNumber);

  const handleUpdateQty = (item: MenuItem, delta: number) => {
    setCart(prev => {
      const current = prev[item.id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return { ...prev, [item.id]: next };
    });
  };

  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert('Please add at least one food or beverage item to your order.');
      return;
    }

    const order = takeToken(
      studentName.trim() || 'Student Guest',
      studentId.trim() || 'STU-001',
      orderItems,
      counterNumber,
      notes.trim()
    );

    setGeneratedOrder(order);
  };

  const copyTokenInfo = () => {
    if (!generatedOrder) return;
    const text = `College Canteen Token #${generatedOrder.tokenNumber}\nCounter ${generatedOrder.counterNumber}\nStudent: ${generatedOrder.studentName} (${generatedOrder.studentId})\nTotal: ₹${generatedOrder.totalAmount}\nEst. Wait: ${generatedOrder.estimatedWaitMinutes} mins`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Get Digital Canteen Token
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select dishes, customize quantities, and take a contactless token with AI wait prediction.
            </p>
          </div>

          {/* Dynamic AI Wait Estimate Pill */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-600 text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-orange-800 uppercase tracking-wider block">
                AI Predicted Wait
              </span>
              <span className="text-base font-extrabold text-orange-950">
                ~{aiPrediction.estimatedMinutes} mins
              </span>
              <span className="text-[10px] text-orange-700 block">
                ({aiPrediction.confidenceScore}% confidence • {aiPrediction.rushLevel})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Token Success Card */}
      {generatedOrder && (
        <div 
          id="token-generated-success-modal"
          className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-md transition-all animate-in fade-in"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-emerald-200">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-sm">
                #{generatedOrder.tokenNumber}
              </div>
              <div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Token Generated Successfully!
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Ready at Counter {generatedOrder.counterNumber}
                </h2>
                <p className="text-xs text-slate-600">
                  Issued to {generatedOrder.studentName} ({generatedOrder.studentId})
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button
                id="btn-copy-token"
                onClick={copyTokenInfo}
                className="inline-flex items-center gap-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied to Clipboard!' : 'Copy Token Info'}
              </button>

              <button
                id="btn-track-generated-token"
                onClick={() => onNavigate('queue-status')}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-colors"
              >
                Go to Live Queue Tracker
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/70 rounded-lg p-2.5">
              <span className="text-[11px] text-slate-500 block">Est. Wait</span>
              <span className="text-sm font-bold text-slate-800">~{generatedOrder.estimatedWaitMinutes} mins</span>
            </div>
            <div className="bg-white/70 rounded-lg p-2.5">
              <span className="text-[11px] text-slate-500 block">Pickup Counter</span>
              <span className="text-sm font-bold text-slate-800">Counter #{generatedOrder.counterNumber}</span>
            </div>
            <div className="bg-white/70 rounded-lg p-2.5">
              <span className="text-[11px] text-slate-500 block">Order Total</span>
              <span className="text-sm font-bold text-slate-800">₹{generatedOrder.totalAmount}</span>
            </div>
            <div className="bg-white/70 rounded-lg p-2.5">
              <span className="text-[11px] text-slate-500 block">Items Count</span>
              <span className="text-sm font-bold text-slate-800">
                {generatedOrder.items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Order Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Food Menu Catalog */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredMenuItems.map(item => {
              const qty = cart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl p-4 transition-all flex flex-col justify-between ${
                    qty > 0 ? 'border-orange-500 ring-1 ring-orange-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        ● Veg
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ~{item.prepTimeMinutes} mins
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-2">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-slate-900">₹{item.price}</span>
                      <span className="text-[11px] text-slate-400 block">{item.category}</span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      {qty > 0 ? (
                        <div className="flex items-center bg-orange-50 border border-orange-200 rounded-lg p-1">
                          <button
                            id={`btn-decrease-${item.id}`}
                            type="button"
                            onClick={() => handleUpdateQty(item, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center bg-white text-orange-700 hover:bg-orange-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-orange-950">
                            {qty}
                          </span>
                          <button
                            id={`btn-increase-${item.id}`}
                            type="button"
                            onClick={() => handleUpdateQty(item, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center bg-white text-orange-700 hover:bg-orange-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`btn-add-${item.id}`}
                          type="button"
                          onClick={() => handleUpdateQty(item, 1)}
                          className="inline-flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Student Details & Order Summary */}
        <div className="space-y-4">
          <form onSubmit={handleGenerateToken} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Utensils className="w-4 h-4 text-orange-600" />
              Token & Student Details
            </h2>

            {/* Student Name */}
            <div>
              <label htmlFor="student-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Student / Guest Name *
              </label>
              <div className="relative">
                <input
                  id="student-name-input"
                  type="text"
                  required
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Student Roll / ID */}
            <div>
              <label htmlFor="student-id-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Roll Number / Student ID *
              </label>
              <div className="relative">
                <input
                  id="student-id-input"
                  type="text"
                  required
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  placeholder="e.g. CS-2024-042"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Counter Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pickup Counter
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-select-counter-1"
                  onClick={() => setCounterNumber(1)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                    counterNumber === 1
                      ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-bold ring-1 ring-orange-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-bold">Counter 1</span>
                  <span className="text-[10px] text-slate-500 font-normal">Meals & Platters</span>
                </button>

                <button
                  type="button"
                  id="btn-select-counter-2"
                  onClick={() => setCounterNumber(2)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                    counterNumber === 2
                      ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-bold ring-1 ring-orange-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-bold">Counter 2</span>
                  <span className="text-[10px] text-slate-500 font-normal">Snacks & Drinks</span>
                </button>
              </div>

              {/* AI suggestion tip */}
              {aiPrediction.suggestedCounter !== counterNumber && (
                <div className="mt-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-2 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Smart Suggestion: Counter {aiPrediction.suggestedCounter} queue is moving faster!
                  </span>
                </div>
              )}
            </div>

            {/* Special Instructions */}
            <div>
              <label htmlFor="notes-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Special Request (Optional)
              </label>
              <input
                id="notes-input"
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Less spicy, extra chutney"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Order Items Basket List */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Order Items ({orderItems.length})
              </span>

              {orderItems.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                  No items selected yet. Tap items from the menu.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {orderItems.map(item => (
                    <div
                      key={item.menuItemId}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-50"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        <span className="text-slate-400 ml-1">×{item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Wait Breakdown */}
            <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Wait Time</span>
                <span className="font-semibold text-orange-700">~{aiPrediction.estimatedMinutes} mins</span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
                <span>Total Payable</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            {/* AI queue note */}
            <p className="text-[11px] text-slate-500 italic">
              * {aiPrediction.aiInsight}
            </p>

            {/* Submit Button */}
            <button
              id="btn-confirm-get-token"
              type="submit"
              disabled={orderItems.length === 0}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Generate Digital Token (₹{totalAmount})
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
