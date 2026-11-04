import { useState, useEffect } from 'react';
import api from '../api.js';

export default function PurchasesView() {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del modal de compra
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProv, setSelectedProv] = useState('');
  const [nota, setNota] = useState('');
  const [items, setItems] = useState([
    { producto_id: '', cantidad: 1, precio_unitario: 0 },
  ]);

  const [toastMsg, setToastMsg] = useState(null);
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const money = (n) => '$' + Math.round(n || 0).toLocaleString('es-CL');
  const fmtDate = (iso) => (iso ? iso.replace('T', ' ').slice(0, 16) : '—');

  const loadData = async () => {
    try {
      const [compList, provList, prodList] = await Promise.all([
        api.compras.list(),
        api.proveedores.list(),
        api.productos.list(),
      ]);
      setCompras(compList);
      setProveedores(provList);
      setProductos(prodList);
    } catch (err) {
      showToast('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Agregar fila de producto a la compra
  const handleAddItem = () => {
    setItems([...items, { producto_id: '', cantidad: 1, precio_unitario: 0 }]);
  };

  // Quitar fila
  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Actualizar un campo de un ítem
  const handleItemChange = (index, field, value) => {
    const next = [...items];
    next[index][field] = value;

    // Si cambia de producto, auto-completar el precio de compra registrado
    if (field === 'producto_id') {
      const prod = productos.find((p) => String(p.id) === String(value));
      if (prod) {
        next[index].precio_unitario = prod.precio_compra;
      }
    }
    setItems(next);
  };

  // Cálculo del total dinámico con Array.reduce (Semana 6)
  const totalCompra = items.reduce(
    (acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0),
    0
  );

  // Guardar compra
  const handleSaveCompra = async (e) => {
    e.preventDefault();
    const validItems = items.filter((it) => it.producto_id && Number(it.cantidad) > 0);
    if (validItems.length === 0) {
      showToast('Agrega al menos un producto válido');
      return;
    }

    try {
      await api.compras.create({
        proveedor_id: selectedProv ? Number(selectedProv) : null,
        nota: nota.trim(),
        items: validItems.map((it) => ({
          producto_id: Number(it.producto_id),
          cantidad: Number(it.cantidad),
          precio_unitario: Number(it.precio_unitario),
        })),
      });

      showToast('Compra registrada con éxito y stock actualizado');
      setIsModalOpen(false);
      setSelectedProv('');
      setNota('');
      setItems([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);
      loadData();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  // Anular compra
  const handleAnular = async (id) => {
    if (!window.confirm('¿Anular esta compra? Esto revertirá el stock sumado.')) return;
    try {
      await api.compras.anular(id);
      showToast('Compra anulada');
      loadData();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  if (loading) return <div className="p-4 text-secondary">Cargando compras...</div>;

  return (
    <div>
      {/* Toast Flotante */}
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

      {/* Botón Registrar Compra */}
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            setItems([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]);
            setIsModalOpen(true);
          }}
        >
          + Registrar compra
        </button>
      </div>

      {/* Tabla de Compras */}
      <div className="card bg-body-tertiary border-secondary">
        <div className="card-body p-0">
          {compras.length === 0 ? (
            <div className="p-4 text-center text-secondary">No hay compras registradas.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Proveedor</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map((c) => (
                    <tr key={c.id}>
                      <td className="mono text-secondary small">{fmtDate(c.fecha)}</td>
                      <td className="fw-semibold text-light">{c.proveedor_nombre || 'Sin proveedor'}</td>
                      <td>
                        <span
                          className={`badge ${c.estado === 'completada' ? 'bg-success' : 'bg-danger'}`}
                        >
                          {c.estado}
                        </span>
                      </td>
                      <td className="mono fw-bold text-warning">{money(c.total)}</td>
                      <td className="text-end">
                        {c.estado !== 'anulada' && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleAnular(c.id)}
                          >
                            Anular
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Registrar Compra */}
      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-body-tertiary border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-warning">Registrar Compra a Proveedor</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
              </div>
              <form onSubmit={handleSaveCompra}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="compra-prov">Proveedor</label>
                    <select
                      id="compra-prov"
                      className="form-select"
                      value={selectedProv}
                      onChange={(e) => setSelectedProv(e.target.value)}
                    >
                      <option value="">Sin proveedor asignado</option>
                      {proveedores.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Lista dinámica de productos */}
                  <label className="form-label">Productos de la compra *</label>
                  {items.map((item, index) => (
                    <div key={index} className="row g-2 mb-2 align-items-center">
                      <div className="col-12 col-md-5">
                        <select
                          className="form-select form-select-sm"
                          required
                          value={item.producto_id}
                          onChange={(e) => handleItemChange(index, 'producto_id', e.target.value)}
                        >
                          <option value="">Seleccionar producto...</option>
                          {productos.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock_actual})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-4 col-md-2">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="Cant."
                          min="1"
                          required
                          value={item.cantidad}
                          onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                        />
                      </div>
                      <div className="col-5 col-md-3">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="P. Unitario"
                          min="0"
                          required
                          value={item.precio_unitario}
                          onChange={(e) => handleItemChange(index, 'precio_unitario', e.target.value)}
                        />
                      </div>
                      <div className="col-3 col-md-2 text-end">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm w-100"
                          disabled={items.length === 1}
                          onClick={() => handleRemoveItem(index)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm mt-2"
                    onClick={handleAddItem}
                  >
                    + Agregar otro producto
                  </button>

                  <div className="mt-3">
                    <label className="form-label" htmlFor="compra-nota">Nota adicional</label>
                    <input
                      type="text"
                      id="compra-nota"
                      className="form-control"
                      placeholder="N° factura, guía de despacho o comentario..."
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary d-flex justify-content-between">
                  <div className="fs-5 fw-bold text-warning">
                    Total: {money(totalCompra)}
                  </div>
                  <div>
                    <button type="button" className="btn btn-outline-light me-2" onClick={() => setIsModalOpen(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Confirmar y Guardar Compra
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}