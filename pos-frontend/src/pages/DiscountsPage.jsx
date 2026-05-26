import { useState, useEffect } from 'react';
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../api';
import toast from 'react-hot-toast';

function DiscountFormModal({ discount, onSave, onClose }) {
  const [name, setName]             = useState(discount?.name || '');
  const [percentage, setPercentage] = useState(discount?.percentage || '');
  const [isActive, setIsActive]     = useState(discount?.is_active ?? true);
  const [saving, setSaving]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (discount) {
        await updateDiscount(discount.id, { name, percentage: parseFloat(percentage), is_active: isActive });
        toast.success('Discount updated!');
      } else {
        await createDiscount({ name, percentage: parseFloat(percentage), is_active: isActive });
        toast.success('Discount created!');
      }
      onSave();
    } catch (err) {
      const msg = err.response?.data?.errors?.name?.[0] || err.response?.data?.message || 'Failed to save.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{discount ? 'Edit Discount' : 'Add Discount Type'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div className="form-group">
            <label className="form-label">Discount Name</label>
            <input
              id="discount-name"
              type="text"
              className="form-input"
              placeholder="e.g. Senior Citizen"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Percentage (%)</label>
            <input
              id="discount-percentage"
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              className="form-input"
              placeholder="e.g. 20"
              value={percentage}
              onChange={e => setPercentage(e.target.value)}
              required
            />
            {percentage && (
              <span style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>
                {parseFloat(percentage).toFixed(2)}% discount applied on gross total
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                id="discount-active"
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              <span>Active (visible to cashiers)</span>
            </label>
          </div>

          <div className="modal-footer">
            <button id="discount-form-cancel" type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="discount-form-save" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : (discount ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);

  const load = async () => {
    try {
      const res = await getDiscounts();
      setDiscounts(res.data);
    } catch { toast.error('Failed to load discounts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (d) => {
    if (!confirm(`Delete "${d.name}"? This cannot be undone.`)) return;
    try {
      await deleteDiscount(d.id);
      toast.success('Discount deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleSaved = () => { setShowForm(false); load(); };

  return (
    <>
      <div className="items-layout">
        <div className="page-header">
          <div>
            <h1 className="page-title">Discount Types</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Admin-managed discounts applied by cashiers at checkout
            </p>
          </div>
          <button id="add-discount-btn" className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
            + Add Discount
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse" style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 60 }}>Loading…</div>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Percentage</th>
                <th>Status</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map(d => (
                <tr key={d.id} id={`discount-row-${d.id}`}>
                  <td style={{ fontWeight: 600 }}>🏷️ {d.name}</td>
                  <td>
                    <span style={{
                      fontSize: 16, fontWeight: 800, color: 'var(--accent)',
                      background: 'rgba(76,175,80,0.1)', borderRadius: 6, padding: '2px 10px'
                    }}>
                      {parseFloat(d.percentage).toFixed(0)}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${d.is_active ? 'badge-green' : 'badge-red'}`}>
                      {d.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        id={`edit-discount-${d.id}`}
                        className="btn btn-secondary btn-icon"
                        onClick={() => { setEditItem(d); setShowForm(true); }}
                        title="Edit"
                      >✏️</button>
                      <button
                        id={`del-discount-${d.id}`}
                        className="btn btn-danger btn-icon"
                        onClick={() => handleDelete(d)}
                        title="Delete"
                      >🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {discounts.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    No discount types yet. Click "Add Discount" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <DiscountFormModal
          discount={editItem}
          onSave={handleSaved}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
