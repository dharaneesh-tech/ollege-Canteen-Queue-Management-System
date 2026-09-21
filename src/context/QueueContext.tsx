import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TokenOrder, MenuItem, OrderItem, OrderStatus } from '../types';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '../utils/initialData';
import { soundManager } from '../utils/sound';

interface QueueContextType {
  menuItems: MenuItem[];
  orders: TokenOrder[];
  myActiveTokenId: string | null;
  myActiveOrder: TokenOrder | null;
  currentServingToken: number;
  soundEnabled: boolean;
  simulationActive: boolean;
  activeNotification: { title: string; message: string; type: 'approaching' | 'ready' } | null;
  setSoundEnabled: (enabled: boolean) => void;
  setSimulationActive: (active: boolean) => void;
  setMyActiveTokenId: (id: string | null) => void;
  dismissNotification: () => void;
  takeToken: (
    studentName: string,
    studentId: string,
    items: OrderItem[],
    counterNumber: number,
    notes?: string
  ) => TokenOrder;
  updateTokenStatus: (orderId: string, status: OrderStatus) => void;
  callNextToken: (counterNumber?: number) => void;
  setCurrentServingTokenManual: (tokenNum: number) => void;
  cancelMyToken: (orderId: string) => void;
  resetQueue: () => void;
  addWalkInOrder: (
    studentName: string,
    items: OrderItem[],
    counterNumber: number
  ) => TokenOrder;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

const STORAGE_ORDERS_KEY = 'college_canteen_orders_v1';
const STORAGE_MY_TOKEN_KEY = 'college_canteen_my_active_token_v1';
const STORAGE_SOUND_KEY = 'college_canteen_sound_v1';

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_SOUND_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [orders, setOrders] = useState<TokenOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_ORDERS;
  });

  const [myActiveTokenId, setMyActiveTokenIdState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_MY_TOKEN_KEY) || 'order-105'; // default to an active demo token
  });

  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<{
    title: string;
    message: string;
    type: 'approaching' | 'ready';
  } | null>(null);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to persist orders to localStorage', e);
    }
  }, [orders]);

  // Sync active token to localStorage
  useEffect(() => {
    if (myActiveTokenId) {
      localStorage.setItem(STORAGE_MY_TOKEN_KEY, myActiveTokenId);
    } else {
      localStorage.removeItem(STORAGE_MY_TOKEN_KEY);
    }
  }, [myActiveTokenId]);

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    soundManager.enabled = val;
    localStorage.setItem(STORAGE_SOUND_KEY, JSON.stringify(val));
  };

  // Determine current serving token number
  const preparingOrReady = orders.filter(o => o.status === 'preparing' || o.status === 'ready');
  const currentServingToken = preparingOrReady.length > 0 
    ? Math.max(...preparingOrReady.map(o => o.tokenNumber))
    : orders.filter(o => o.status === 'completed').length > 0
    ? Math.max(...orders.filter(o => o.status === 'completed').map(o => o.tokenNumber))
    : 101;

  const myActiveOrder = orders.find(o => o.id === myActiveTokenId) || null;

  // Watch for changes in student's order status to send notifications
  useEffect(() => {
    if (!myActiveOrder) return;

    if (myActiveOrder.status === 'ready') {
      soundManager.playReadyChime();
      setActiveNotification({
        title: `Token #${myActiveOrder.tokenNumber} is READY!`,
        message: `Your food is ready at Counter ${myActiveOrder.counterNumber}. Please pick it up!`,
        type: 'ready',
      });
    } else if (myActiveOrder.status === 'preparing') {
      // Calculate how many waiting ahead
      const ahead = orders.filter(
        o => o.status === 'waiting' && o.tokenNumber < myActiveOrder.tokenNumber
      ).length;

      if (ahead <= 1) {
        soundManager.playApproachingChime();
        setActiveNotification({
          title: `Your Turn is Approaching! (Token #${myActiveOrder.tokenNumber})`,
          message: `Kitchen is preparing your order at Counter ${myActiveOrder.counterNumber}. Please be near the pickup area.`,
          type: 'approaching',
        });
      }
    }
  }, [myActiveOrder?.status, myActiveOrder?.tokenNumber]);

  const dismissNotification = () => {
    setActiveNotification(null);
  };

  const takeToken = useCallback(
    (
      studentName: string,
      studentId: string,
      items: OrderItem[],
      counterNumber: number,
      notes?: string
    ): TokenOrder => {
      soundManager.playClickTone();

      // Find next token number
      const highestToken = orders.length > 0 
        ? Math.max(...orders.map(o => o.tokenNumber)) 
        : 100;
      const nextTokenNumber = highestToken + 1;

      // Base prep time
      const maxPrep = items.length > 0 ? Math.max(...items.map(i => i.prepTimeMinutes)) : 5;
      const waitingCount = orders.filter(
        o => (o.status === 'waiting' || o.status === 'preparing') && o.counterNumber === counterNumber
      ).length;
      const estimatedWaitMinutes = Math.max(3, maxPrep + Math.round(waitingCount * 2.5));

      const newOrder: TokenOrder = {
        id: `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tokenNumber: nextTokenNumber,
        studentName: studentName.trim() || 'Student Guest',
        studentId: studentId.trim() || `ID-${Math.floor(1000 + Math.random() * 9000)}`,
        counterNumber,
        items,
        totalAmount: items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0),
        status: 'waiting',
        createdAt: Date.now(),
        estimatedWaitMinutes,
        notes,
      };

      setOrders(prev => [newOrder, ...prev]);
      setMyActiveTokenIdState(newOrder.id);
      return newOrder;
    },
    [orders]
  );

  const addWalkInOrder = useCallback(
    (studentName: string, items: OrderItem[], counterNumber: number): TokenOrder => {
      return takeToken(studentName, 'WALK-IN', items, counterNumber, 'Counter Walk-In Cash Order');
    },
    [takeToken]
  );

  const updateTokenStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const updated: TokenOrder = { ...order, status };
        if (status === 'ready') {
          updated.readyAt = Date.now();
        } else if (status === 'completed') {
          updated.completedAt = Date.now();
        }
        return updated;
      })
    );
  }, []);

  const callNextToken = useCallback((counterNumber?: number) => {
    setOrders(prev => {
      // Find oldest waiting order (optionally filtered by counter)
      const waitingOrders = prev
        .filter(o => o.status === 'waiting' && (!counterNumber || o.counterNumber === counterNumber))
        .sort((a, b) => a.tokenNumber - b.tokenNumber);

      if (waitingOrders.length === 0) return prev;

      const nextToServe = waitingOrders[0];

      // If there's an order currently 'preparing' at this counter, mark it 'ready'
      const updated = prev.map(o => {
        if (o.counterNumber === nextToServe.counterNumber && o.status === 'preparing') {
          return { ...o, status: 'ready' as OrderStatus, readyAt: Date.now() };
        }
        if (o.id === nextToServe.id) {
          return { ...o, status: 'preparing' as OrderStatus };
        }
        return o;
      });

      soundManager.playApproachingChime();
      return updated;
    });
  }, []);

  const setCurrentServingTokenManual = useCallback((tokenNum: number) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.tokenNumber === tokenNum) {
          return { ...o, status: 'preparing' as OrderStatus };
        }
        if (o.tokenNumber < tokenNum && (o.status === 'waiting' || o.status === 'preparing')) {
          return { ...o, status: 'completed' as OrderStatus, completedAt: Date.now() };
        }
        return o;
      })
    );
  }, []);

  const cancelMyToken = useCallback((orderId: string) => {
    updateTokenStatus(orderId, 'cancelled');
    setMyActiveTokenIdState(null);
  }, [updateTokenStatus]);

  const resetQueue = useCallback(() => {
    setOrders(INITIAL_ORDERS);
    setMyActiveTokenIdState('order-105');
    localStorage.removeItem(STORAGE_ORDERS_KEY);
    localStorage.removeItem(STORAGE_MY_TOKEN_KEY);
    setActiveNotification(null);
  }, []);

  // Viva Simulation effect: advances queue periodically if enabled
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      setOrders(prev => {
        // Look for preparing order to mark ready
        const preparingOrder = prev.find(o => o.status === 'preparing');
        if (preparingOrder) {
          return prev.map(o =>
            o.id === preparingOrder.id ? { ...o, status: 'ready', readyAt: Date.now() } : o
          );
        }

        // Look for ready order to mark completed
        const readyOrder = prev.find(o => o.status === 'ready');
        if (readyOrder) {
          return prev.map(o =>
            o.id === readyOrder.id ? { ...o, status: 'completed', completedAt: Date.now() } : o
          );
        }

        // Look for waiting order to mark preparing
        const waitingOrder = prev
          .filter(o => o.status === 'waiting')
          .sort((a, b) => a.tokenNumber - b.tokenNumber)[0];

        if (waitingOrder) {
          return prev.map(o => (o.id === waitingOrder.id ? { ...o, status: 'preparing' } : o));
        }

        return prev;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [simulationActive]);

  return (
    <QueueContext.Provider
      value={{
        menuItems,
        orders,
        myActiveTokenId,
        myActiveOrder,
        currentServingToken,
        soundEnabled,
        simulationActive,
        activeNotification,
        setSoundEnabled,
        setSimulationActive,
        setMyActiveTokenId: setMyActiveTokenIdState,
        dismissNotification,
        takeToken,
        updateTokenStatus,
        callNextToken,
        setCurrentServingTokenManual,
        cancelMyToken,
        resetQueue,
        addWalkInOrder,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};
