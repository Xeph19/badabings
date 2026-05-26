import { useState, useEffect } from 'react';
import { getDiscounts } from '../../api';
import toast from 'react-hot-toast';

export default function DiscountPicker({ onApply, onClose, currentDiscountId }) {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getDiscounts()
      .then(res => setDiscounts(res.data.filter(d => d.is_active)))
      .catch(() => toast.error('Failed to load discounts'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Apply Discount</h2>

        {loading ? (
          <div className="animate-pulse" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
            Loading discounts…
          </div>
        ) : discounts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            No active discounts configured.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {discounts.map(d => (
              <button
                key={d.id}
                id={`discount-pick-${d.id}`}
                onClick={() => { onApply(d); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: currentDiscountId === d.id ? 'rgba(76,175,80,0.12)' : 'var(--bg-surface)',
                  border: currentDiscountId === d.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {parseFloat(d.percentage).toFixed(0)}% off total
                  </div>
                </div>
                <div style={{
                  fontSize: 16, fontWeight: 800, color: 'var(--accent)',
                  background: 'rgba(76,175,80,0.1)', borderRadius: 8,
                  padding: '4px 10px',
                }}>
                  -{parseFloat(d.percentage).toFixed(0)}%
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="modal-footer" style={{ marginTop: 16 }}>
          {currentDiscountId && (
            <button
              id="discount-remove"
              className="btn btn-danger"
              onClick={() => { onApply(null); onClose(); }}
            >
              Remove Discount
            </button>
          )}
          <button id="discount-cancel" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
