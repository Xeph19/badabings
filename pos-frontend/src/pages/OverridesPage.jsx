import { useState, useEffect } from 'react';
import { getOverrides, upsertOverride, deleteOverride } from '../api';
import toast from 'react-hot-toast';

export default function OverridesPage() {
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [date, setDate]           = useState('');
  const [type, setType]           = useState('daily');
  const [amount, setAmount]       = useState('');
  const [note, setNote]           = useState('');
  const [saving, setSaving]       = useState(false);

  const load = async () => {
    try {
      const res = await getOverrides();
      setOverrides(res.data);
    } catch {
      toast.error('Failed to load overrides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!date || !amount) return;

    setSaving(true);
    try {
      await upsertOverride({
        period_date: date,
        period_type: type,
        override_amount: parseFloat(amount),
        note: note
      });
      toast.success('Sales override saved successfully!');
      // Reset form
      setDate('');
      setAmount('');
      setNote('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save override');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this override?')) return;
    try {
      await deleteOverride(id);
      toast.success('Override removed');
      load();
    } catch {
      toast.error('Failed to remove override');
    }
  };

  const fmtDate = (d, t) => {
    const dateObj = new Date(d + 'T00:00:00');
    if (t === 'monthly') {
      return dateObj.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
    }
    return dateObj.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="items-layout" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
      {/* Left Pane - Form */}
      <div>
        <h1 className="page-title" style={{ marginBottom: 4 }}>Sales Override</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
          Configure artificial sales values to display in the main dashboard.
        </p>

        <div className="override-form-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--accent)' }}>🔧 Adjust Sales</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Period Type</label>
              <select
                id="override-period-type"
                className="form-select"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="daily">Daily Override</option>
                <option value="monthly">Monthly Override</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{type === 'monthly' ? 'Target Month' : 'Target Date'}</label>
              <input
                id="override-date"
                type={type === 'monthly' ? 'month' : 'date'}
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Adjusted Revenue (₱)</label>
              <input
                id="override-amount"
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Note / Reason</label>
              <textarea
                id="override-note"
                className="form-input"
                style={{ height: 60, resize: 'none' }}
                placeholder="e.g. Catering adjustments..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            <button
              id="override-submit"
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: 8 }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Apply Adjustment'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Pane - History Table */}
      <div>
        <h2 className="page-title" style={{ fontSize: 16, marginBottom: 20 }}>📋 Sales Adjustments Log</h2>

        {loading ? (
          <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading adjustments...</div>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>Target Period</th>
                <th>Type</th>
                <th>Adjusted Amount</th>
                <th>Note</th>
                <th style={{ width: 80 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {overrides.map(o => (
                <tr key={o.id} id={`override-row-${o.id}`}>
                  <td style={{ fontWeight: 600 }}>{fmtDate(o.period_date, o.period_type)}</td>
                  <td>
                    <span className={`badge ${o.period_type === 'monthly' ? 'badge-green' : 'badge-orange'}`} style={{ textTransform: 'uppercase', fontSize: 9 }}>
                      {o.period_type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                    ₱{parseFloat(o.override_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{o.note || '—'}</td>
                  <td>
                    <button
                      id={`delete-override-${o.id}`}
                      className="btn btn-danger btn-icon"
                      onClick={() => handleDelete(o.id)}
                      title="Delete override"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {overrides.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    No overrides active. Use the form on the left to adjust sales data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
