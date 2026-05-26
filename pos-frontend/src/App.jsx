import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider, useOrder } from './context/OrderContext';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Layout/Sidebar';
import SalesPage from './pages/SalesPage';
import ReceiptsPage from './pages/ReceiptsPage';
import ShiftPage from './pages/ShiftPage';
import ItemsPage from './pages/ItemsPage';
import DiscountsPage from './pages/DiscountsPage';
import OverridesPage from './pages/OverridesPage';
import BackOfficePage from './pages/BackOfficePage';
import TicketPane from './components/Ticket/TicketPane';

function SettingsPage() {
  const { user, isAdmin } = useAuth();
  return (
    <div style={{ padding: 32, flex: 1, overflowY: 'auto' }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Settings</h1>
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border)', maxWidth: 420 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Logged in as</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{user?.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{user?.email}</div>
        <div style={{ marginTop: 12 }}>
          <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-cashier'}`} style={{ fontSize: 12 }}>
            {isAdmin ? '🔑 Admin' : '👤 Cashier'}
          </span>
        </div>
      </div>
    </div>
  );
}

function SupportPage() {
  return (
    <div style={{ padding: 32, flex: 1 }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Support</h1>
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 20, border: '1px solid var(--border)', maxWidth: 400, color: 'var(--text-secondary)', fontSize: 13 }}>
        <p>For support, contact your system administrator.</p>
        <p style={{ marginTop: 8 }}>Version: 1.1.0 · Bedabings POS</p>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Access Denied</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>You don't have permission to view this page.</div>
    </div>
  );
}

// Pages that show the ticket pane (POS view only)
const TICKET_PAGES = ['sales'];

// Admin-only pages
const ADMIN_PAGES = ['backoffice', 'items', 'discounts', 'overrides', 'settings'];

function AppContent() {
  const { user, isAdmin } = useAuth();
  const [page, setPage] = useState('sales');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  
  const { items: orderItems, netTotal } = useOrder();
  const cartCount = orderItems ? orderItems.reduce((acc, item) => acc + item.qty, 0) : 0;

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#overrides') {
        if (isAdmin) {
          setPage('overrides');
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isAdmin]);

  if (!user) return <LoginPage />;

  const showTicket = TICKET_PAGES.includes(page);

  const handleNavigate = (key) => {
    // Cashiers cannot access admin pages
    if (!isAdmin && ADMIN_PAGES.includes(key)) return;
    setPage(key);
    setIsSidebarOpen(false);
  };

  const renderPage = () => {
    // Block cashier from admin pages
    if (!isAdmin && ADMIN_PAGES.includes(page)) return <AccessDenied />;

    switch (page) {
      case 'sales':      return <SalesPage />;
      case 'receipts':   return <ReceiptsPage />;
      case 'shift':      return <ShiftPage />;
      case 'items':      return <ItemsPage />;
      case 'discounts':  return <DiscountsPage />;
      case 'overrides':  return <OverridesPage />;
      case 'settings':   return <SettingsPage />;
      case 'backoffice': return <BackOfficePage />;
      case 'support':    return <SupportPage />;
      default:           return <SalesPage />;
    }
  };

  const getPageTitle = () => {
    if (page === 'sales') return 'Bedabings POS';
    if (page === 'backoffice') return 'Analytics';
    return page.charAt(0).toUpperCase() + page.slice(1);
  };

  return (
    <div className={`app-shell${showTicket ? ' has-ticket' : ''}`}>
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <button id="mobile-menu-toggle" className="mobile-header-btn" onClick={() => setIsSidebarOpen(true)}>
          ☰
        </button>
        <span className="mobile-header-title">{getPageTitle()}</span>
        {showTicket && (
          <button id="mobile-cart-toggle" className="mobile-header-btn cart-btn" onClick={() => setIsTicketOpen(true)}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        )}
      </header>

      {/* Sidebar overlay for mobile drawer */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <Sidebar 
        activePage={page} 
        onNavigate={handleNavigate} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="main-content-area">
        {renderPage()}
      </main>

      {showTicket && (
        <TicketPane 
          isOpen={isTicketOpen} 
          onClose={() => setIsTicketOpen(false)} 
        />
      )}

      {/* Mobile Floating Cart Button */}
      {showTicket && cartCount > 0 && (
        <button id="mobile-fab-cart" className="floating-cart-fab" onClick={() => setIsTicketOpen(true)}>
          <span style={{ fontSize: 18 }}>🛒</span>
          <span style={{ flex: 1, textAlign: 'left', fontWeight: 600 }}>View Ticket ({cartCount})</span>
          <span style={{ fontWeight: 700 }}>₱{netTotal.toFixed(2)}</span>
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontSize: '13px',
            },
          }}
        />
      </OrderProvider>
    </AuthProvider>
  );
}
