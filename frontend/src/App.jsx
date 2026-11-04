import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/topbar.jsx';
import DashboardView from './views/DashboardView.jsx';
import ProductsView from './views/ProductsView.jsx';
import CategoriesView from './views/CatergoriesView.jsx';
import SuppliersView from './views/SuppliersView.jsx';
import StockMovesView from './views/StockMovesView.jsx';
import PurchasesView from './views/PurchasesView.jsx';


export default function App() {

  const [currentView, setCurrentView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');


  const titles = {
    dashboard: 'Dashboard',
    productos: 'Productos',
    categorias: 'Categorías',
    proveedores: 'Proveedores',
    compras: 'Compras',
    movimientos: 'Movimientos de stock',
  };

  return (
    <div className="container-fluid app-shell">
      <div className="row ">
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => setCurrentView(view)}
        />

        {/* contenido principal */}
        <main className="col-12 col-md-9 col-lg-10 content py-3 px-4">
          <Topbar
            title={titles[currentView] || 'Voltyx'}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showSearch={currentView === 'productos'}
          />

    <section id="view-root" className="view-root mt-4">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'productos' && <ProductsView searchTerm={searchTerm} />}
        {currentView === 'categorias' && <CategoriesView />}
        {currentView === 'proveedores' && <SuppliersView />}
        {currentView === 'compras' && <PurchasesView />}
        {currentView === 'movimientos' && <StockMovesView />}
    </section>
        </main>
      </div>
    </div>
  );
}