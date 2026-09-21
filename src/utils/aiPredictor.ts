import { OrderItem, TokenOrder } from '../types';

/**
 * AI-powered Predictive Wait Time and Queue Analytics Engine
 * Combines item prep complexity, active counter throughput, 
 * queue depth, and time-of-day rush curves.
 */
export interface PredictionResult {
  estimatedMinutes: number;
  confidenceScore: number; // 0-100%
  rushFactor: number;
  rushLevel: 'Low' | 'Moderate' | 'High Rush';
  suggestedCounter: number;
  aiInsight: string;
}

export function calculateEstimatedWait(
  items: OrderItem[],
  existingOrders: TokenOrder[],
  preferredCounter: number = 1
): PredictionResult {
  // 1. Base Item Preparation Time (parallel kitchen factor)
  if (items.length === 0) {
    return {
      estimatedMinutes: 0,
      confidenceScore: 95,
      rushFactor: 1.0,
      rushLevel: 'Low',
      suggestedCounter: 1,
      aiInsight: 'Add items to calculate dynamic wait time.',
    };
  }

  // Max individual prep time + 40% time for additional distinct items
  const maxItemPrep = Math.max(...items.map(i => i.prepTimeMinutes), 2);
  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const additionalPrepMultiplier = Math.min(6, (totalItemCount - 1) * 0.8);
  const orderBasePrepTime = maxItemPrep + additionalPrepMultiplier;

  // 2. Queue Backlog ahead at the preferred counter
  const activeOrdersAtCounter = existingOrders.filter(
    o => (o.status === 'waiting' || o.status === 'preparing') && o.counterNumber === preferredCounter
  );
  
  const otherCounter = preferredCounter === 1 ? 2 : 1;
  const activeOrdersAtOther = existingOrders.filter(
    o => (o.status === 'waiting' || o.status === 'preparing') && o.counterNumber === otherCounter
  );

  // Approximate 2.5 minutes per waiting order ahead handled by kitchen pipeline
  const queueMinutesAhead = activeOrdersAtCounter.reduce((acc, order) => {
    if (order.status === 'preparing') return acc + 2.0;
    return acc + 2.8;
  }, 0);

  // 3. Time-of-day Rush Multiplier
  const currentHour = new Date().getHours();
  let rushFactor = 1.0;
  let rushLevel: 'Low' | 'Moderate' | 'High Rush' = 'Low';

  if (currentHour >= 12 && currentHour <= 14) {
    // Lunch Rush
    rushFactor = 1.35;
    rushLevel = 'High Rush';
  } else if (currentHour >= 10 && currentHour <= 11) {
    // Morning Break Rush
    rushFactor = 1.2;
    rushLevel = 'Moderate';
  } else if (currentHour >= 16 && currentHour <= 17) {
    // Evening Snacks Rush
    rushFactor = 1.25;
    rushLevel = 'Moderate';
  } else if (activeOrdersAtCounter.length >= 4) {
    rushFactor = 1.3;
    rushLevel = 'High Rush';
  }

  // Calculate raw total estimated minutes
  const rawMinutes = (orderBasePrepTime * 0.75 + queueMinutesAhead) * rushFactor;
  const estimatedMinutes = Math.max(2, Math.round(rawMinutes));

  // 4. Counter Suggestion
  const suggestedCounter = activeOrdersAtOther.length < activeOrdersAtCounter.length ? otherCounter : preferredCounter;

  // 5. Smart AI Insights
  let aiInsight = '';
  if (activeOrdersAtCounter.length === 0) {
    aiInsight = 'Kitchen line is clear! Your order will be prepared with minimal delay.';
  } else if (activeOrdersAtOther.length < activeOrdersAtCounter.length) {
    const diff = activeOrdersAtCounter.length - activeOrdersAtOther.length;
    aiInsight = `Counter ${otherCounter} has ${diff} fewer orders right now. Choosing Counter ${otherCounter} could save ~${Math.round(diff * 2.5)} mins!`;
  } else if (rushLevel === 'High Rush') {
    aiInsight = 'Peak lunch rush detected. Live queue updates will keep you informed when to walk over.';
  } else {
    aiInsight = `Expected queue turnaround is ~${Math.round(queueMinutesAhead)} mins for ${activeOrdersAtCounter.length} orders ahead.`;
  }

  return {
    estimatedMinutes,
    confidenceScore: Math.min(96, Math.max(78, 100 - activeOrdersAtCounter.length * 3)),
    rushFactor,
    rushLevel,
    suggestedCounter,
    aiInsight,
  };
}

/**
 * Calculates current queue stats and peak hours mock distribution
 */
export function generateQueueStats(orders: TokenOrder[]) {
  const activeOrders = orders.filter(o => o.status === 'waiting' || o.status === 'preparing');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const totalWait = completedOrders.reduce((sum, o) => sum + (o.estimatedWaitMinutes || 6), 0);
  const avgWaitTimeMinutes = completedOrders.length > 0 ? Math.round((totalWait / completedOrders.length) * 10) / 10 : 7;

  // Hourly stats for peak hours chart
  const hourlyData = [
    { hour: '09:00 AM', orders: 12, avgWait: 4 },
    { hour: '10:00 AM', orders: 28, avgWait: 6 },
    { hour: '11:00 AM', orders: 42, avgWait: 9 },
    { hour: '12:00 PM', orders: 78, avgWait: 16 },
    { hour: '01:00 PM', orders: 95, avgWait: 19 },
    { hour: '02:00 PM', orders: 64, avgWait: 12 },
    { hour: '03:00 PM', orders: 31, avgWait: 5 },
    { hour: '04:00 PM', orders: 49, avgWait: 8 },
  ];

  return {
    avgWaitTimeMinutes,
    totalTokensIssued: orders.length,
    completedOrdersCount: completedOrders.length,
    currentActiveQueueCount: activeOrders.length,
    peakHour: '12:30 PM - 01:30 PM (Lunch Rush)',
    rushLevel: activeOrders.length > 5 ? ('High Rush' as const) : activeOrders.length > 2 ? ('Moderate' as const) : ('Low' as const),
    hourlyData,
  };
}
