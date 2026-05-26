import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [items, setItems]                 = useState([]);
  const [orderType, setOrderType]         = useState('dine_in');
  const [appliedDiscount, setAppliedDiscount] = useState(null); // { id, name, percentage }

  const addItem = useCallback((menuItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === menuItem.id);
      if (existing) {
        return prev.map(i => i.id === menuItem.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...menuItem, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    }
  }, []);

  const clearOrder = useCallback(() => {
    setItems([]);
    setAppliedDiscount(null);
  }, []);

  const applyDiscount = useCallback((discount) => {
    setAppliedDiscount(discount);
  }, []);

  const removeDiscount = useCallback(() => {
    setAppliedDiscount(null);
  }, []);

  // Derived totals (computed, not stored)
  const grossTotal    = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    return parseFloat((grossTotal * (appliedDiscount.percentage / 100)).toFixed(2));
  }, [grossTotal, appliedDiscount]);
  const netTotal      = useMemo(() => parseFloat((grossTotal - discountAmount).toFixed(2)), [grossTotal, discountAmount]);
  const itemCount     = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  // Legacy alias
  const total = netTotal;

  return (
    <OrderContext.Provider value={{
      items, orderType, setOrderType,
      appliedDiscount, applyDiscount, removeDiscount,
      addItem, removeItem, updateQty, clearOrder,
      grossTotal, discountAmount, netTotal, total, itemCount,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => useContext(OrderContext);
