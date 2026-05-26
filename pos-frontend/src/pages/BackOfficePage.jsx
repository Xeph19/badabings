import { useState, useEffect, useCallback, Fragment } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getAnalytics, voidOrder } from '../api';
import toast from 'react-hot-toast';

// ── Helpers ─────────────────────────────────────────────────────────────────
const peso = (v) => `₱${Number(v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
const pesoShort = (v) => {
  const n = Number(v || 0);
  if (n >= 1000000) return `₱${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `₱${(n / 1000).toFixed(1)}K`;
  return `₱${n.toFixed(2)}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: {peso(p.value)}
        </p>
      ))}
    </div>
  );
};

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color = 'var(--accent)', highlight = false }) {
  return (
    <div className={`kpi-card${highlight ? ' kpi-highlight' : ''}`}>
      <div className="kpi-icon" style={{ color }}>{icon}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color: highlight ? color : 'var(--text-primary)' }}>
        {peso(value)}
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

// ── Time Navigation Bar ──────────────────────────────────────────────────────
function TimeNav({ view, date, month, year, onNavigate }) {
  const goToday = () => {
    const today = new Date();
    if (view === 'day') {
      onNavigate({ date: today.toISOString().slice(0, 10) });
    } else {
      onNavigate({ month: today.getMonth() + 1, year: today.getFullYear() });
    }
  };

  return (
    <div className="time-nav-bar">
      <div className="time-nav-views">
        <button
          id="view-day"
          className={`time-nav-btn${view === 'day' ? ' active' : ''}`}
          onClick={() => onNavigate({ view: 'day', date: date })}
        >Day</button>
        <button
          id="view-month"
          className={`time-nav-btn${view === 'month' ? ' active' : ''}`}
          onClick={() => onNavigate({ view: 'month', month, year })}
        >Month</button>
      </div>

      <div className="time-nav-controls" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {view === 'day' ? (
          <input
            id="time-date-picker"
            type="date"
            className="form-input"
            style={{
              width: 150,
              padding: '5px 10px',
              fontSize: 13,
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              outline: 'none'
            }}
            value={date}
            onChange={(e) => {
              if (e.target.value) onNavigate({ date: e.target.value });
            }}
          />
        ) : (
          <input
            id="time-month-picker"
            type="month"
            className="form-input"
            style={{
              width: 150,
              padding: '5px 10px',
              fontSize: 13,
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              outline: 'none'
            }}
            value={`${year}-${String(month).padStart(2, '0')}`}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m] = e.target.value.split('-');
                onNavigate({ year: parseInt(y), month: parseInt(m) });
              }
            }}
          />
        )}
        <button
          id="time-today"
          className="btn btn-secondary"
          style={{ fontSize: 11, padding: '6px 12px' }}
          onClick={goToday}
        >
          Current
        </button>
      </div>
    </div>
  );
}

// OverridePanel removed and relocated to Overrides Page

// ── Order Log Table ──────────────────────────────────────────────────────────
function OrderLog({ orders, loading, search, onSearch, onStatusFilter, statusFilter, onVoid, onPageChange }) {
  const [expanded, setExpanded] = useState(null);

  const statusColors = { completed: 'badge-green', voided: 'badge-red', open: 'badge-orange' };

  return (
    <div className="chart-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Table header / controls */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>📋 Customer Order Log</div>
        <div className="search-bar" style={{ width: 220 }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="order-log-search"
            type="text"
            placeholder="Search customer / order #"
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
        <select
          id="order-log-status"
          className="form-select"
          value={statusFilter}
          onChange={e => onStatusFilter(e.target.value)}
          style={{ width: 130 }}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="voided">Voided</option>
          <option value="open">Open</option>
        </select>
      </div>

      {loading ? (
        <div className="animate-pulse" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          Loading orders…
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="items-table" style={{ borderRadius: 0, border: 'none' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Discount</th>
                  <th>Gross</th>
                  <th>Discount (₱)</th>
                  <th>Net</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(orders?.data || []).map(order => (
                  <Fragment key={order.id}>
                    <tr id={`order-row-${order.id}`}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{order.id}</td>
                      <td style={{ fontSize: 12 }}>
                        {new Date(order.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <span className="badge badge-green" style={{ textTransform: 'capitalize', fontSize: 10 }}>
                          {(order.order_type || '').replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{order.customer_name || '—'}</td>
                      <td style={{ fontSize: 12 }}>
                        {order.discount_name
                          ? <span style={{ color: 'var(--accent)', fontSize: 11 }}>🏷️ {order.discount_name} ({parseFloat(order.discount_percent || 0).toFixed(0)}%)</span>
                          : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                        }
                      </td>
                      <td style={{ fontSize: 12 }}>₱{parseFloat(order.gross_amount || order.total || 0).toFixed(2)}</td>
                      <td style={{ fontSize: 12, color: order.discount_amount > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                        {order.discount_amount > 0 ? `−₱${parseFloat(order.discount_amount).toFixed(2)}` : '—'}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: 13 }}>₱{parseFloat(order.net_amount || order.total || 0).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${statusColors[order.status] || 'badge-green'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            id={`expand-order-${order.id}`}
                            className="btn btn-secondary btn-icon"
                            style={{ fontSize: 11 }}
                            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                          >{expanded === order.id ? '▲' : '▼'}</button>
                          {order.status === 'completed' && (
                            <button
                              id={`void-order-${order.id}`}
                              className="btn btn-danger btn-icon"
                              style={{ fontSize: 11 }}
                              onClick={() => onVoid(order)}
                              title="Void order"
                            >✕</button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded === order.id && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={10} style={{ padding: '8px 20px 16px 32px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Line Items</div>
                          {(order.items || []).map(item => (
                            <div key={item.id} style={{
                              display: 'flex', justifyContent: 'space-between',
                              padding: '3px 0', fontSize: 12, color: 'var(--text-secondary)'
                            }}>
                              <span>{item.item_name} × {item.quantity}</span>
                              <span>₱{parseFloat(item.subtotal).toFixed(2)}</span>
                            </div>
                          ))}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {(orders?.data || []).length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                      No orders for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {orders && orders.last_page > 1 && (
            <div style={{
              padding: '12px 20px', borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 12, color: 'var(--text-muted)',
            }}>
              <span>Page {orders.current_page} of {orders.last_page} ({orders.total} orders)</span>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  disabled={orders.current_page <= 1}
                  onClick={() => onPageChange(orders.current_page - 1)}
                >← Prev</button>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  disabled={orders.current_page >= orders.last_page}
                  onClick={() => onPageChange(orders.current_page + 1)}
                >Next →</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function BackOfficePage() {
  const today = new Date();
  const [view, setView]       = useState('day');
  const [date, setDate]       = useState(today.toISOString().slice(0, 10));
  const [month, setMonth]     = useState(today.getMonth() + 1);
  const [year, setYear]       = useState(today.getFullYear());
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]       = useState(1);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const buildParams = useCallback(() => {
    const p = { view, search, status_filter: statusFilter, page, per_page: 20 };
    if (view === 'day') p.date = date;
    else { p.month = month; p.year = year; }
    return p;
  }, [view, date, month, year, search, statusFilter, page]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAnalytics(buildParams());
      setData(res.data);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  }, [buildParams]);

  useEffect(() => { load(); }, [load]);

  const handleNavigate = (changes) => {
    setPage(1);
    if (changes.view !== undefined) setView(changes.view);
    if (changes.date !== undefined) setDate(changes.date);
    if (changes.month !== undefined) setMonth(changes.month);
    if (changes.year !== undefined) setYear(changes.year);
  };

  const handleVoid = async (order) => {
    if (!confirm(`Void order #${order.id} for ₱${parseFloat(order.net_amount || order.total || 0).toFixed(2)}? This will record a refund.`)) return;
    try {
      await voidOrder(order.id);
      toast.success(`Order #${order.id} voided`);
      load();
    } catch { toast.error('Failed to void order'); }
  };

  const handleSearch = (s) => { setSearch(s); setPage(1); };
  const handleStatusFilter = (s) => { setStatusFilter(s); setPage(1); };

  const kpis = data?.kpis;
  const trend = data?.trend || [];
  const orders = data?.orders;

  return (
    <div className="analytics-layout">
      {/* Time Nav */}
      <TimeNav
        view={view} date={date} month={month} year={year}
        onNavigate={handleNavigate}
      />

      {loading && !data ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <div className="animate-pulse" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Loading analytics…
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="kpi-grid">
            <KpiCard icon="💰" label="Gross Sales"     value={kpis?.gross_sales}    sub={`${kpis?.order_count || 0} orders`} />
            <KpiCard icon="🔄" label="Refunds"         value={kpis?.refunds}         color="var(--danger)" />
            <KpiCard icon="🏷️" label="Discounts Total" value={kpis?.discount_total}  color="var(--warning)" />
            <KpiCard icon="📊" label="Net Sales"       value={kpis?.net_sales}       highlight color="var(--accent)" />
            <KpiCard icon="📈" label="Gross Profit"    value={kpis?.gross_profit}    sub={`Avg ₱${parseFloat(kpis?.avg_order_value || 0).toFixed(2)}/order`} color="#42a5f5" />
          </div>

          {/* Calculation breakdown */}
          <div className="kpi-formula-bar">
            <span>Gross Sales <strong>{peso(kpis?.gross_sales)}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>−</span>
            <span>Discounts <strong style={{ color: 'var(--warning)' }}>{peso(kpis?.discount_total)}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>−</span>
            <span>Refunds <strong style={{ color: 'var(--danger)' }}>{peso(kpis?.refunds)}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>=</span>
            <span>Net Sales <strong style={{ color: 'var(--accent)' }}>{peso(kpis?.net_sales)}</strong></span>
          </div>

          {/* Charts */}
          <div className="chart-card">
            <div className="chart-title">
              {view === 'day' ? '⏱️ Hourly Revenue Trend' : '📅 Daily Revenue Trend'}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trend} margin={{ top: 4, right: 16, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: '#9e9e9e', fontSize: 10 }} />
                <YAxis tickFormatter={v => pesoShort(v)} tick={{ fill: '#9e9e9e', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#9e9e9e' }} />
                <Bar dataKey="gross" name="Gross" fill="#42a5f5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net"   name="Net"   fill="#4caf50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Order Log */}
          <OrderLog
            orders={orders}
            loading={ordersLoading}
            search={search}
            onSearch={handleSearch}
            statusFilter={statusFilter}
            onStatusFilter={handleStatusFilter}
            onVoid={handleVoid}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
