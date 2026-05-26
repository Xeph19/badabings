import { useState, useEffect } from 'react';
import { getCurrentShift, openShift, closeShift, getShifts } from '../api';
import toast from 'react-hot-toast';

export default function ShiftPage() {
  const [currentShift, setCurrentShift] = useState(null);
  const [shifts, setShifts]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [openCash, setOpenCash]         = useState('');
  const [closeCash, setCloseCash]       = useState('');
  const [processing, setProcessing]     = useState(false);

  const loadShift = async () => {
    try {
      const [curRes, listRes] = await Promise.all([getCurrentShift(), getShifts()]);
      setCurrentShift(curRes.data);
      setShifts(listRes.data.data || listRes.data);
    } catch { toast.error('Failed to load shift data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadShift(); }, []);

  const handleOpen = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await openShift({ opening_cash: parseFloat(openCash) });
      toast.success('Shift opened!');
      setOpenCash('');
      loadShift();
    } catch { toast.error('Failed to open shift'); }
    finally { setProcessing(false); }
  };

  const handleClose = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await closeShift({ closing_cash: parseFloat(closeCash) });
      toast.success('Shift closed!');
      setCloseCash('');
      loadShift();
    } catch { toast.error('Failed to close shift'); }
    finally { setProcessing(false); }
  };

  const fmt = (v) => `₱${parseFloat(v || 0).toFixed(2)}`;

  return (
    <div className="shift-layout">
      <h1 className="page-title" style={{ marginBottom: 20 }}>Shift Management</h1>

      {/* Current shift card */}
      <div className="shift-card" style={{ marginBottom: 24 }}>
        {currentShift ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)'
              }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>Shift Open</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Opened</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
              {new Date(currentShift.opened_at).toLocaleString('en-PH')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Opening Cash</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)', marginBottom: 20 }}>
              {fmt(currentShift.opening_cash)}
            </div>

            <form onSubmit={handleClose} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Closing Cash (₱)</label>
                <input
                  id="shift-close-cash"
                  type="number" step="0.01" min="0"
                  className="form-input"
                  placeholder="0.00"
                  value={closeCash}
                  onChange={e => setCloseCash(e.target.value)}
                  required
                />
              </div>
              <button id="close-shift-btn" type="submit" className="btn btn-danger w-full" disabled={processing}>
                {processing ? 'Closing…' : '🔒 Close Shift'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 13 }}>
              No active shift. Open one to begin selling.
            </div>
            <form onSubmit={handleOpen} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Opening Cash (₱)</label>
                <input
                  id="shift-open-cash"
                  type="number" step="0.01" min="0"
                  className="form-input"
                  placeholder="0.00"
                  value={openCash}
                  onChange={e => setOpenCash(e.target.value)}
                  required
                />
              </div>
              <button id="open-shift-btn" type="submit" className="btn btn-primary w-full" disabled={processing}>
                {processing ? 'Opening…' : '🟢 Open Shift'}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Shift history */}
      {shifts.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Shift History
          </div>
          <table className="items-table">
            <thead>
              <tr><th>Opened</th><th>Closed</th><th>Opening ₱</th><th>Closing ₱</th><th>Status</th></tr>
            </thead>
            <tbody>
              {shifts.map(s => (
                <tr key={s.id}>
                  <td style={{ fontSize: 12 }}>{new Date(s.opened_at).toLocaleString('en-PH')}</td>
                  <td style={{ fontSize: 12 }}>{s.closed_at ? new Date(s.closed_at).toLocaleString('en-PH') : '—'}</td>
                  <td>{fmt(s.opening_cash)}</td>
                  <td>{s.closing_cash ? fmt(s.closing_cash) : '—'}</td>
                  <td>
                    <span className={`badge ${!s.closed_at ? 'badge-green' : 'badge-red'}`}>
                      {!s.closed_at ? 'Open' : 'Closed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
