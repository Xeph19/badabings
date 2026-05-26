import { useAuth } from '../../context/AuthContext';

const ADMIN_NAV = [
  { key: 'sales',      label: 'Sales',       icon: '🛒' },
  { key: 'receipts',   label: 'Receipts',    icon: '🧾' },
  { key: 'shift',      label: 'Shift',       icon: '⏰' },
  { key: 'items',      label: 'Items',       icon: '📋' },
  { key: 'discounts',  label: 'Discounts',   icon: '🏷️' },
  { key: 'settings',   label: 'Settings',    icon: '⚙️' },
  { key: 'backoffice', label: 'Analytics',   icon: '📊' },
  { key: 'support',    label: 'Support',     icon: '❓' },
];

const CASHIER_NAV = [
  { key: 'sales',    label: 'Sales',    icon: '🛒' },
  { key: 'shift',    label: 'Shift',    icon: '⏰' },
  { key: 'receipts', label: 'Receipts', icon: '🧾' },
  { key: 'support',  label: 'Support',  icon: '❓' },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { user, logout, isAdmin } = useAuth();
  const navItems = isAdmin ? ADMIN_NAV : CASHIER_NAV;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="store-name">
          {user?.name}
          <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-cashier'}`}>
            {isAdmin ? 'Admin' : 'Cashier'}
          </span>
        </div>
        <div className="store-sub">POS 1 · Bedabings</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            id={`nav-${item.key}`}
            className={`nav-item${activePage === item.key ? ' active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span style={{ fontSize: 17 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <button id="nav-logout" className="nav-item" onClick={logout} style={{ marginTop: 'auto' }}>
        <span style={{ fontSize: 17 }}>🚪</span>
        Sign Out
      </button>

      <div className="sidebar-version">v1.1.0</div>
    </aside>
  );
}
