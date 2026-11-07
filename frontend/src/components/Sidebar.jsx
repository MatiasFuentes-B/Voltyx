// Componente Sidebar de Voltyx
// Recibe por props: 'currentView' (vista activa) y 'onSelectView' (función para cambiar de vista)
export default function Sidebar({ currentView, onSelectView }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'productos', label: 'Productos' },
    { id: 'categorias', label: 'Categorias' },
    { id: 'proveedores', label: 'Proveedores' },
    { id: 'compras', label: 'Compras' },
    { id: 'movimientos', label: 'Movimientos' },
  ];

  return (
    <aside className="col-12 col-md-3 col-lg-2 sidebar d-flex flex-column">
      <div className="brand d-flex align-items-center gap-3">
        <div className="brand-mark d-flex align-items-center justify-content-center">V</div>
        <div className="brand-text">
          <strong>VOLTYX</strong>
          <span>inventario &amp; compras</span>
        </div>
      </div>

      <nav className="nav flex-column" id="nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item d-flex align-items-center gap-2 ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onSelectView(item.id)}
          >
            <span className="nav-dot"></span> {item.label}
          </button>
        ))}
      </nav>

      <div className="hazard-strip" aria-hidden="true"></div>
      <div className="sidebar-footer mt-auto">
        API: <span id="api-status" className="badge status-on">React Activo</span>
      </div>
    </aside>
  );
}