import { useState, useEffect } from 'react';
import api from '../api.js';
import StockGauge from '../components/StockGauge.jsx';

export default function ProductsView({ searchTerm = '' }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros de estado local (Semana 6)
  const [selectedCat, setSelectedCat] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Estados para el Modal de Producto (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    categoria_id: '',
    precio_compra: 0,
    precio_venta: 0,
    stock_actual: 0,
    stock_minimo: 0,
    descripcion: '',
  });

  // Estado para modal de movimiento rápido de stock
  const [movModalOpen, setMovModalOpen] = useState(false);
  const [movProduct, setMovProduct] = useState(null);
  const [movData, setMovData] = useState({ tipo: 'entrada', cantidad: 1, motivo: '' });

  // Notificación Toast
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const money = (n) => '$' + Math.round(n || 0).toLocaleString('es-CL');

  // Cargar productos y categorías al inicio
  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        api.productos.list(),
        api.categorias.list(),
      ]);
      setProductos(prods);
      setCategorias(cats);
    } catch (err) {
      showToast('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lógica de filtrado en tiempo real con métodos de Array (filter)
  const filteredProducts = productos.filter((p) => {
    // 1. Filtro por buscador (searchTerm recibido por props desde App)
    const matchesSearch =
      searchTerm === '' ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Filtro por categoría seleccionada
    const matchesCat = selectedCat === '' || String(p.categoria_id) === String(selectedCat);

    // 3. Filtro por bajo stock
    const matchesLowStock = !onlyLowStock || p.stock_actual <= p.stock_minimo;

    return matchesSearch && matchesCat && matchesLowStock;
  });

  // Abrir modal para crear o editar
  const handleOpenModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        nombre: prod.nombre,
        codigo: prod.codigo || '',
        categoria_id: prod.categoria_id || '',
        precio_compra: prod.precio_compra,
        precio_venta: prod.precio_venta,
        stock_actual: prod.stock_actual,
        stock_minimo: prod.stock_minimo,
        descripcion: prod.descripcion || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        nombre: '',
        codigo: '',
        categoria_id: '',
        precio_compra: 0,
        precio_venta: 0,
        stock_actual: 0,
        stock_minimo: 0,
        descripcion: '',
      });
    }
    setIsModalOpen(true);
  };

  // Guardar producto con validación
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      showToast('El nombre del producto es obligatorio');
      return;
    }

    try {
      const payload = {
        ...formData,
        categoria_id: formData.categoria_id ? Number(formData.categoria_id) : null,
        precio_compra: Number(formData.precio_compra) || 0,
        precio_venta: Number(formData.precio_venta) || 0,
        stock_minimo: Number(formData.stock_minimo) || 0,
      };

      if (editingProduct) {
        await api.productos.update(editingProduct.id, payload);
        showToast('Producto actualizado correctamente');
      } else {
        payload.stock_actual = Number(formData.stock_actual) || 0;
        await api.productos.create(payload);
        showToast('Producto creado con éxito');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Error al guardar: ' + err.message);
    }
  };

  // Dar de baja producto
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Dar de baja este producto? (Se conservará su historial de movimientos)')) return;
    try {
      await api.productos.remove(id);
      showToast('Producto dado de baja');
      loadData();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  // Registrar movimiento rápido de stock
  const handleSaveMovement = async (e) => {
    e.preventDefault();
    try {
      await api.movimientos.create({
        producto_id: movProduct.id,
        tipo: movData.tipo,
        cantidad: Number(movData.cantidad),
        motivo: movData.motivo.trim() || 'Ajuste manual',
      });
      showToast('Movimiento registrado con éxito');
      setMovModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  if (loading) return <div className="p-4 text-secondary">Cargando inventario de productos...</div>;

  return (
    <div>
      {/* Toast de notificación flotante */}
      {toastMsg && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
          <div className="toast show align-items-center text-bg-warning border-0 p-2">
            <div className="d-flex">
              <div className="toast-body fw-bold text-dark">{toastMsg}</div>
              <button type="button" className="btn-close me-2 m-auto" onClick={() => setToastMsg(null)}></button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Filtros y Botón Nuevo Producto */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-3">
          {/* Filtro por Categoría */}
          <select
            className="form-select form-select-sm w-auto bg-body-tertiary border-secondary text-light"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          {/* Filtro Solo Bajo Stock */}
          <div className="form-check d-flex align-items-center gap-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="f-bajo-stock"
              checked={onlyLowStock}
              onChange={(e) => setOnlyLowStock(e.target.checked)}
            />
            <label className="form-check-label small text-secondary" htmlFor="f-bajo-stock">
              Solo bajo stock
            </label>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Nuevo producto
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className="card bg-body-tertiary border-secondary">
        <div className="card-body p-0">
          {filteredProducts.length === 0 ? (
            <div className="p-4 text-center text-secondary">No se encontraron productos con los filtros aplicados.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Código</th>
                    <th>Categoría</th>
                    <th>Precio Venta</th>
                    <th>Stock</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold">{p.nombre}</td>
                      <td className="mono text-secondary">{p.codigo || '—'}</td>
                      <td className="text-secondary">{p.categoria_nombre || '—'}</td>
                      <td className="mono">{money(p.precio_venta)}</td>
                      <td>
                        <StockGauge actual={p.stock_actual} minimo={p.stock_minimo} />
                      </td>
                      <td className="text-end text-nowrap">
                        <button
                          className="btn btn-outline-light btn-sm me-2"
                          onClick={() => {
                            setMovProduct(p);
                            setMovData({ tipo: 'entrada', cantidad: 1, motivo: '' });
                            setMovModalOpen(true);
                          }}
                        >
                          Stock
                        </button>
                        <button
                          className="btn btn-outline-warning btn-sm me-2"
                          onClick={() => handleOpenModal(p)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          Baja
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Crear / Editar Producto */}
      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-body-tertiary border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-warning">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
              </div>
              <form onSubmit={handleSaveProduct}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label" htmlFor="prod-nombre">Nombre *</label>
                      <input
                        type="text"
                        id="prod-nombre"
                        className="form-control"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label" htmlFor="prod-codigo">Código SKU</label>
                      <input
                        type="text"
                        id="prod-codigo"
                        className="form-control"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label" htmlFor="prod-cat">Categoría</label>
                      <select
                        id="prod-cat"
                        className="form-select"
                        value={formData.categoria_id}
                        onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                      >
                        <option value="">Sin categoría</option>
                        {categorias.map((c) => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label" htmlFor="prod-pc">Precio Compra *</label>
                      <input
                        type="number"
                        id="prod-pc"
                        className="form-control"
                        min="0"
                        required
                        value={formData.precio_compra}
                        onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label" htmlFor="prod-pv">Precio Venta *</label>
                      <input
                        type="number"
                        id="prod-pv"
                        className="form-control"
                        min="0"
                        required
                        value={formData.precio_venta}
                        onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                      />
                    </div>
                    {!editingProduct && (
                      <div className="col-6">
                        <label className="form-label" htmlFor="prod-stock">Stock Inicial *</label>
                        <input
                          type="number"
                          id="prod-stock"
                          className="form-control"
                          min="0"
                          required
                          value={formData.stock_actual}
                          onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="col-6">
                      <label className="form-label" htmlFor="prod-min">Stock Mínimo *</label>
                      <input
                        type="number"
                        id="prod-min"
                        className="form-control"
                        min="0"
                        required
                        value={formData.stock_minimo}
                        onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="prod-desc">Descripción</label>
                      <textarea
                        id="prod-desc"
                        className="form-control"
                        rows="2"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-outline-light" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Ajustar Stock (Movimiento) */}
      {movModalOpen && movProduct && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-body-tertiary border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-warning">Ajustar Stock: {movProduct.nombre}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setMovModalOpen(false)}></button>
              </div>
              <form onSubmit={handleSaveMovement}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Tipo de movimiento</label>
                    <select
                      className="form-select"
                      value={movData.tipo}
                      onChange={(e) => setMovData({ ...movData, tipo: e.target.value })}
                    >
                      <option value="entrada">Entrada (Aumentar stock)</option>
                      <option value="salida">Salida (Disminuir stock)</option>
                      <option value="ajuste">Ajuste de inventario</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cantidad</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      required
                      value={movData.cantidad}
                      onChange={(e) => setMovData({ ...movData, cantidad: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Motivo</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Conteo físico, reposición, merma..."
                      value={movData.motivo}
                      onChange={(e) => setMovData({ ...movData, motivo: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-outline-light" onClick={() => setMovModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Confirmar Movimiento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}