import { useState, useEffect } from 'react';
import { getMenuItems, getCategories } from '../api';
import { useOrder } from '../context/OrderContext';
import toast from 'react-hot-toast';

const FOOD_EMOJI = ['🍖', '🍗', '🥩', '🍤', '🦐', '🍜', '🍛', '🥘', '🫕', '🍝'];

function getEmoji(name) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return FOOD_EMOJI[Math.abs(hash) % FOOD_EMOJI.length];
}

function SkeletonCard() {
  return <div className="skeleton skeleton-card" />;
}

export default function SalesPage() {
  const [items, setItems]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const { addItem } = useOrder();

  useEffect(() => {
    Promise.all([getMenuItems(), getCategories()])
      .then(([itemsRes, catsRes]) => {
        setItems(itemsRes.data);
        setCategories(catsRes.data);
      })
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(item => {
    const matchCat = activeCategory === 'all' || item.category_id === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddItem = (item) => {
    if (!item.is_available) return;
    addItem(item);
    toast.success(`${item.name} added`, { duration: 800, icon: '✅' });
  };

  return (
    <div className="workspace">
      {/* Search bar */}
      <div className="workspace-header">
        <div className="search-bar" style={{ maxWidth: 320 }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="menu-search"
            type="text"
            placeholder="Search items…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="category-bar">
        <button
          id="cat-all"
          className={`category-chip${activeCategory === 'all' ? ' active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            id={`cat-${cat.id}`}
            className={`category-chip${activeCategory === cat.id ? ' active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="menu-grid">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.map(item => (
            <div
              key={item.id}
              id={`menu-item-${item.id}`}
              className={`menu-item-card${!item.is_available ? ' unavailable' : ''}`}
              onClick={() => handleAddItem(item)}
            >
              {item.image_url
                ? <img className="card-img" src={item.image_url} alt={item.name} loading="lazy" />
                : <div className="card-img-placeholder">{getEmoji(item.name)}</div>
              }
              <div className="card-body">
                <div className="card-name">{item.name}</div>
                <div className="card-price">₱{parseFloat(item.price).toFixed(2)}</div>
              </div>
            </div>
          ))
        }
        {!loading && filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', paddingTop: 60 }}>
            No items found
          </div>
        )}
      </div>
    </div>
  );
}
