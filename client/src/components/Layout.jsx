import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import { CherryDoodle, CandyDoodle } from './Decorations.jsx';

const Layout = ({ hideSidebar = false }) => (
  <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
    <CherryDoodle style={{ top: 90, left: 24 }} size={44} />
    <CandyDoodle style={{ top: 160, right: 40 }} size={38} floatDelay={1} />
    <CherryDoodle style={{ top: 640, right: 12 }} size={36} floatDelay={2} />

    <Navbar />
    <main className="container" style={{ padding: '28px 20px 80px', position: 'relative', zIndex: 1 }}>
      {hideSidebar ? (
        <Outlet />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 26, alignItems: 'start' }}>
          <div style={{ minWidth: 0 }}>
            <Outlet />
          </div>
          <div style={{ position: 'sticky', top: 90 }} className="sidebar-col">
            <Sidebar />
          </div>
        </div>
      )}
    </main>

    <style>{`
      @media (max-width: 880px) {
        .sidebar-col { display: none; }
        main > div { grid-template-columns: 1fr !important; }
      }
    `}</style>
  </div>
);

export default Layout;
