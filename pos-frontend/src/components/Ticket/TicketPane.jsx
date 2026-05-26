import { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { createOrder } from '../../api';
import DiscountPicker from './DiscountPicker';
import toast from 'react-hot-toast';

function formatTime() {
  return new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
}

function ChargeModal({ grossTotal, discountAmount, netTotal, appliedDiscount, onConfirm, onClose }) {
  const [cash, setCash] = useState('');
  const parsedCash = parseFloat(cash) || 0;
  const change = parsedCash - netTotal;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal charge-modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Charge Order</h2>

        <div className="charge-total-display">
          <div className="label">Total Amount Due</div>
          <div className="amount">₱{netTotal.toFixed(2)}</div>
          {appliedDiscount && (
            <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>
              {appliedDiscount.name} ({parseFloat(appliedDiscount.percentage).toFixed(0)}% off applied)
            </div>
          )}
        </div>

        {appliedDiscount && (
          <div style={{
            background: 'rgba(76,175,80,0.08)', borderRadius: 8,
            padding: '10px 14px', marginBottom: 14, fontSize: 12,
            display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)',
            border: '1px solid var(--border-accent)',
          }}>
            <span>Gross: ₱{grossTotal.toFixed(2)}</span>
            <span style={{ color: 'var(--accent)' }}>Discount: −₱{discountAmount.toFixed(2)}</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Net: ₱{netTotal.toFixed(2)}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Cash Received</label>
          <input
            id="charge-cash"
            type="number"
            className="form-input"
            placeholder="0.00"
            min={netTotal}
            step="0.01"
            value={cash}
            onChange={e => setCash(e.target.value)}
            autoFocus
          />
        </div>

        {parsedCash >= netTotal && (
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '12px 0 0', borderTop: '1px solid var(--border)', marginTop: 12
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Change</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 18 }}>
              ₱{change.toFixed(2)}
            </span>
          </div>
        )}

        <div className="modal-footer">
          <button id="charge-cancel" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            id="charge-confirm"
            className="btn btn-primary"
            disabled={parsedCash < netTotal}
            onClick={onConfirm}
          >
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TicketPane({ isOpen, onClose }) {
  const {
    items, orderType, setOrderType,
    updateQty, clearOrder,
    appliedDiscount, applyDiscount, removeDiscount,
    grossTotal, discountAmount, netTotal,
  } = useOrder();

  const [showCharge, setShowCharge]   = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [charging, setCharging]         = useState(false);
  const time = formatTime();

  const handleCharge = async () => {
    setCharging(true);
    try {
      await createOrder({
        order_type:  orderType,
        discount_id: appliedDiscount?.id ?? null,
        items: items.map(i => ({ menu_item_id: i.id, quantity: i.qty })),
      });
      clearOrder();
      setShowCharge(false);
      if (onClose) onClose(); // Auto-close ticket pane on successful checkout
      toast.success('Order completed! 🎉', { duration: 2000 });
    } catch {
      toast.error('Failed to save order.');
    } finally {
      setCharging(false);
    }
  };

  const handleApplyDiscount = (discount) => {
    if (discount) applyDiscount(discount);
    else removeDiscount();
  };

  return (
    <>
      {/* Mobile background overlay for ticket drawer */}
      {isOpen && (
        <div className="ticket-overlay" onClick={onClose} />
      )}

      <div className={`ticket-pane${isOpen ? ' mobile-open' : ''}`}>
        {/* Header */}
        <div className="ticket-header">
          <div>
            <div className="ticket-title">Ticket</div>
            <div className="ticket-time">{time}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {items.length > 0 && (
              <button id="ticket-clear" className="btn btn-danger btn-icon" onClick={clearOrder} title="Clear order">
                🗑️
              </button>
            )}
            <button className="ticket-close-btn" onClick={onClose} title="Close ticket">×</button>
          </div>
        </div>

        {/* Order type */}
        <div className="ticket-type-select">
          <select id="ticket-order-type" value={orderType} onChange={e => setOrderType(e.target.value)}>
            <option value="dine_in">Dine In</option>
            <option value="takeout">Takeout</option>
          </select>
        </div>

        {/* Items */}
        <div className="ticket-items">
          {items.length === 0 ? (
            <div className="ticket-empty">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>No items yet</span>
              <span style={{ fontSize: 11 }}>Click menu items to add</span>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="ticket-item" id={`ticket-item-${item.id}`}>
                <div className="ticket-item-info">
                  <div className="ticket-item-name">{item.name}</div>
                  <div className="ticket-item-price">₱{parseFloat(item.price).toFixed(2)} each</div>
                </div>
                <div className="ticket-qty-controls">
                  <button id={`qty-dec-${item.id}`} className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                  <span className="qty-val">{item.qty}</span>
                  <button id={`qty-inc-${item.id}`} className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                </div>
                <div className="ticket-item-subtotal">₱{(item.price * item.qty).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>

        {/* Discount section */}
        {items.length > 0 && (
          <div className="ticket-discount-section">
            {appliedDiscount ? (
              <div className="discount-applied-row">
                <div>
                  <div className="discount-applied-name">🏷️ {appliedDiscount.name}</div>
                  <div className="discount-applied-sub">
                    {parseFloat(appliedDiscount.percentage).toFixed(0)}% · −₱{discountAmount.toFixed(2)}
                  </div>
                </div>
                <button
                  id="discount-change"
                  className="btn btn-secondary"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setShowDiscount(true)}
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                id="ticket-apply-discount"
                className="discount-trigger-btn"
                onClick={() => setShowDiscount(true)}
              >
                <span>🏷️</span> Apply Discount
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="ticket-footer">
          <div className="ticket-totals">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>₱{grossTotal.toFixed(2)}</span>
            </div>
            {appliedDiscount && (
              <div className="totals-row discount-row">
                <span>Discount ({appliedDiscount.name})</span>
                <span>−₱{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="totals-row grand">
              <span>Total</span>
              <span>₱{netTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="ticket-actions">
            <button id="ticket-save" className="btn-save" disabled={items.length === 0 || charging}>
              SAVE
            </button>
            <button
              id="ticket-charge"
              className="btn-charge"
              disabled={items.length === 0 || charging}
              onClick={() => setShowCharge(true)}
            >
              CHARGE
            </button>
          </div>
        </div>
      </div>

      {showCharge && (
        <ChargeModal
          grossTotal={grossTotal}
          discountAmount={discountAmount}
          netTotal={netTotal}
          appliedDiscount={appliedDiscount}
          onConfirm={handleCharge}
          onClose={() => setShowCharge(false)}
        />
      )}

      {showDiscount && (
        <DiscountPicker
          currentDiscountId={appliedDiscount?.id}
          onApply={handleApplyDiscount}
          onClose={() => setShowDiscount(false)}
        />
      )}
    </>
  );
}
