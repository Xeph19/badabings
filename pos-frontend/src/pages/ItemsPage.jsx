import { useState, useEffect, useRef } from 'react';
import { getMenuItems, getCategories, createMenuItem, updateMenuItem, deleteMenuItem, createCategory, updateCategory, deleteCategory } from '../api';
import toast from 'react-hot-toast';

function ItemFormModal({ item, categories, onSave, onClose }) {
  const [name, setName]         = useState(item?.name || '');
  const [price, setPrice]       = useState(item?.price || '');
  const [catId, setCatId]       = useState(item?.category_id || categories[0]?.id || '');
  const [avail, setAvail]       = useState(item?.is_available ?? true);
  const [imgFile, setImgFile]   = useState(null);
  const [imgPreview, setImgPreview] = useState(item?.image_url || null);
  const [saving, setSaving]     = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('price', price);
      fd.append('category_id', catId);
      fd.append('is_available', avail ? '1' : '0');
      if (imgFile) fd.append('image', imgFile);

      if (item) {
        await updateMenuItem(item.id, fd);
        toast.success('Item updated!');
      } else {
        await createMenuItem(fd);
        toast.success('Item created!');
      }
      onSave();
    } catch {
      toast.error('Failed to save item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{item ? 'Edit Item' : 'Add New Item'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Image upload */}
          <div className="form-group">
            <label className="form-label">Image</label>
            <div className="img-upload-zone" onClick={() => fileRef.current.click()}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              {imgPreview
                ? <img className="img-preview" src={imgPreview} alt="preview" />
                : <div style={{ fontSize: 28, marginBottom: 4 }}>📷</div>
              }
              <div className="upload-text">{imgPreview ? 'Click to change' : 'Click to upload image'}</div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input id="item-name" type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Price (₱)</label>
              <input id="item-price" type="number" step="0.01" min="0" className="form-input" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select id="item-category" className="form-select" value={catId} onChange={e => setCatId(e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ justifyContent: 'flex-end' }}>
              <label className="form-label">Available</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input id="item-available" type="checkbox" checked={avail} onChange={e => setAvail(e.target.checked)} />
                <span style={{ fontSize: 13, color: avail ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {avail ? 'Yes' : 'No'}
                </span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button id="item-form-cancel" type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="item-form-save" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : (item ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryFormModal({ category, onSave, onClose }) {
  const [name, setName]           = useState(category?.name || '');
  const [sortOrder, setSortOrder] = useState(category?.sort_order ?? 0);
  const [saving, setSaving]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name, sort_order: parseInt(sortOrder) };
      if (category) {
        await updateCategory(category.id, data);
        toast.success('Category updated!');
      } else {
        await createCategory(data);
        toast.success('Category created!');
      }
      onSave();
    } catch {
      toast.error('Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{category ? 'Edit Category' : 'Add New Category'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input id="cat-name" type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Sort Order</label>
            <input id="cat-sort-order" type="number" min="0" className="form-input" value={sortOrder} onChange={e => setSortOrder(e.target.value)} required />
          </div>
          <div className="modal-footer">
            <button id="cat-form-cancel" type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="cat-form-save" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : (category ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ItemsPage() {
  const [activeTab, setActiveTab]   = useState('items'); // 'items' | 'categories'
  const [items, setItems]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  // Modals state
  const [showItemForm, setShowItemForm] = useState(false);
  const [editItem, setEditItem]         = useState(null);

  const [showCatForm, setShowCatForm]   = useState(false);
  const [editCat, setEditCat]           = useState(null);

  const loadData = async () => {
    try {
      const [iRes, cRes] = await Promise.all([getMenuItems(), getCategories()]);
      setItems(iRes.data);
      setCategories(cRes.data);
    } catch { toast.error('Failed to load items'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // Item Handlers
  const handleItemEdit = (item) => { setEditItem(item); setShowItemForm(true); };
  const handleItemAdd  = ()     => { setEditItem(null); setShowItemForm(true); };
  const handleItemDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await deleteMenuItem(item.id);
      toast.success('Item deleted');
      loadData();
    } catch { toast.error('Failed to delete item.'); }
  };

  // Category Handlers
  const handleCatEdit = (cat) => { setEditCat(cat); setShowCatForm(true); };
  const handleCatAdd  = ()    => { setEditCat(null); setShowCatForm(true); };
  const handleCatDelete = async (cat) => {
    if (!confirm(`Delete category "${cat.name}"? This will delete all items inside it.`)) return;
    try {
      await deleteCategory(cat.id);
      toast.success('Category deleted');
      loadData();
    } catch { toast.error('Failed to delete category.'); }
  };

  return (
    <>
      <div className="items-layout">
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
          <button
            id="tab-items"
            className={`btn ${activeTab === 'items' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', borderRadius: 8 }}
            onClick={() => setActiveTab('items')}
          >
            📋 Menu Items
          </button>
          <button
            id="tab-categories"
            className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', borderRadius: 8 }}
            onClick={() => setActiveTab('categories')}
          >
            🗂️ Categories
          </button>
        </div>

        {activeTab === 'items' ? (
          <>
            <div className="page-header">
              <h1 className="page-title">Menu Items</h1>
              <button id="add-item-btn" className="btn btn-primary" onClick={handleItemAdd}>
                + Add Item
              </button>
            </div>

            {loading ? (
              <div className="animate-pulse" style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 60 }}>
                Loading items…
              </div>
            ) : (
              <table className="items-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th style={{ width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} id={`item-row-${item.id}`}>
                      <td>
                        <div className="item-thumb">
                          {item.image_url
                            ? <img src={item.image_url} alt={item.name} />
                            : <span>🍽️</span>
                          }
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.category?.name || '—'}</td>
                      <td style={{ color: 'var(--accent)', fontWeight: 600 }}>
                        ₱{parseFloat(item.price).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${item.is_available ? 'badge-green' : 'badge-red'}`}>
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            id={`edit-item-${item.id}`}
                            className="btn btn-secondary btn-icon"
                            onClick={() => handleItemEdit(item)}
                            title="Edit"
                          >✏️</button>
                          <button
                            id={`del-item-${item.id}`}
                            className="btn btn-danger btn-icon"
                            onClick={() => handleItemDelete(item)}
                            title="Delete"
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                        No items yet. Click "Add Item" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <>
            <div className="page-header">
              <h1 className="page-title">Categories</h1>
              <button id="add-cat-btn" className="btn btn-primary" onClick={handleCatAdd}>
                + Add Category
              </button>
            </div>

            {loading ? (
              <div className="animate-pulse" style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 60 }}>
                Loading categories…
              </div>
            ) : (
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Sort Order</th>
                    <th style={{ width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id} id={`cat-row-${cat.id}`}>
                      <td style={{ fontWeight: 600 }}>{cat.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{cat.sort_order}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            id={`edit-cat-${cat.id}`}
                            className="btn btn-secondary btn-icon"
                            onClick={() => handleCatEdit(cat)}
                            title="Edit"
                          >✏️</button>
                          <button
                            id={`del-cat-${cat.id}`}
                            className="btn btn-danger btn-icon"
                            onClick={() => handleCatDelete(cat)}
                            title="Delete"
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                        No categories yet. Click "Add Category" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {showItemForm && (
        <ItemFormModal
          item={editItem}
          categories={categories}
          onSave={() => { setShowItemForm(false); loadData(); }}
          onClose={() => setShowItemForm(false)}
        />
      )}

      {showCatForm && (
        <CategoryFormModal
          category={editCat}
          onSave={() => { setShowCatForm(false); loadData(); }}
          onClose={() => setShowCatForm(false)}
        />
      )}
    </>
  );
}
