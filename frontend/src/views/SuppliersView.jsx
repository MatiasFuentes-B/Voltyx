import { useState, useEffect } from 'react';
import api from '../api.js';

export default function SuppliersView() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
  });
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadProveedores = async () => {
    try {
      const data = await api.proveedores.list();
      setProveedores(data);
    } catch (err) {
      showToast('Error al cargar proveedores: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProveedores();
  }, []);

  // Filtro por búsqueda en tiempo real
  const filtered = proveedores.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) ||
      (p.contacto && p.contacto.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  });

  const handleOpenModal = (prov = null) => {
    if (prov) {
      setEditingSupplier(prov);
      setFormData({
        nombre: prov.nombre,
        contacto: prov.contacto || '',
        telefono: prov.telefono || '',
        email: prov.email || '',
        direccion: prov.direccion || '',
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        nombre: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      showToast('El nombre de la empresa proveedora es obligatorio');
      return;
    }

    try {
      if (editingSupplier) {
        await api.proveedores.update(editingSupplier.id, formData);
        showToast('Proveedor actualizado');
      } else {
        await api.proveedores.create(formData);
        showToast('Proveedor registrado con éxito');
      }
      setIsModalOpen(false);
      loadProveedores();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    try {
      await api.proveedores.remove(id);
      showToast('Proveedor eliminado');
      loadProveedores();
    } catch (err) {
      showToast('Error al eliminar: ' + err.message);
    }
  };

  if (loading) return <div className="p-4 text-secondary">Cargando proveedores...</div>;

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

      {/* Barra de Búsqueda y Botón Nuevo */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <input
          type="text"
          className="form-control form-control-sm w-auto bg-body-tertiary border-secondary text-light"
          style={{ minWidth: '260px' }}
          placeholder="Buscar por empresa, contacto o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Nuevo proveedor
        </button>
      </div>

      {/* Tabla de Proveedores */}
      <div className="card bg-body-tertiary border-secondary">
        <div className="card-body p-0">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-secondary">No se encontraron proveedores.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Dirección</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold text-warning">{p.nombre}</td>
                      <td>{p.contacto || '—'}</td>
                      <td className="mono text-secondary">{p.telefono || '—'}</td>
                      <td className="text-secondary">{p.email || '—'}</td>
                      <td className="small text-secondary">{p.direccion || '—'}</td>
                      <td className="text-end text-nowrap">
                        <button
                          className="btn btn-outline-warning btn-sm me-2"
                          onClick={() => handleOpenModal(p)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteSupplier(p.id)}
                        >
                          Eliminar
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

      {/* Modal Crear / Editar Proveedor */}
      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-body-tertiary border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-warning">
                  {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
              </div>
              <form onSubmit={handleSaveSupplier}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label" htmlFor="prov-nombre">Nombre de la Empresa *</label>
                      <input
                        type="text"
                        id="prov-nombre"
                        className="form-control"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label" htmlFor="prov-contacto">Persona de Contacto</label>
                      <input
                        type="text"
                        id="prov-contacto"
                        className="form-control"
                        value={formData.contacto}
                        onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label" htmlFor="prov-tel">Teléfono</label>
                      <input
                        type="text"
                        id="prov-tel"
                        className="form-control"
                        placeholder="+56 9..."
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="prov-email">Email</label>
                      <input
                        type="email"
                        id="prov-email"
                        className="form-control"
                        placeholder="contacto@empresa.cl"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="prov-dir">Dirección</label>
                      <input
                        type="text"
                        id="prov-dir"
                        className="form-control"
                        placeholder="Calle, número, ciudad..."
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-outline-light" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar Proveedor
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