import { useState, useEffect } from 'react';
import { getOrders } from '../api';
import toast from 'react-hot-toast';

export default function ReceiptsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getOrders()
      .then(res => setOrders(res.data.data || res.data))
      .catch(() => toast.error('Failed to load receipts'))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (v) => `₱${parseFloat(v).toFixed(2)}`;

  return (
    <div className="receipts-layout">
      <div className="page-header">
        <h1 className="page-title">Receipts</h1>
      </div>

      {loading ? (
        <div className="animate-pulse" style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 60 }}>
          Loading receipts…
        </div>
      ) : (
        <table className="items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date & Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Total</th>
              <th>Items</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <>
                <tr key={order.id} id={`receipt-${order.id}`}>
                  <td style={{ color: 'var(--text-muted)' }}>#{order.id}</td>
                  <td style={{ fontSize: 12 }}>
                    {new Date(order.created_at).toLocaleString('en-PH')}
                  </td>
                  <td>
                    <span className="badge badge-green" style={{ textTransform: 'capitalize' }}>
                      {order.order_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${order.status === 'completed' ? 'badge-green' : 'badge-red'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{fmt(order.total)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{order.items?.length ?? 0} item(s)</td>
                  <td>
                    <button
                      id={`expand-receipt-${order.id}`}
                      className="btn btn-secondary btn-icon"
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    >
                      {expanded === order.id ? '▲' : '▼'}
                    </button>
                  </td>
                </tr>
                {expanded === order.id && (
                  <tr key={`${order.id}-detail`}>
                    <td colSpan={7} style={{ padding: '8px 16px 16px 32px', background: 'var(--bg-surface)' }}>
                      {order.items?.map(item => (
                        <div key={item.id} style={{
                          display: 'flex', justifyContent: 'space-between',
                          padding: '4px 0', fontSize: 12, color: 'var(--text-secondary)'
                        }}>
                          <span>{item.item_name} × {item.quantity}</span>
                          <span>{fmt(item.subtotal)}</span>
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
              </>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
