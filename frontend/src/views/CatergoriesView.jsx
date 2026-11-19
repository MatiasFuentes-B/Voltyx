import { useState, useEffect } from 'react';
import api from '../api.js';

export default function CategoriesView() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadCategorias = async () => {
    try {
      const data = await api.categorias.list();
      setCategorias(data);
    } catch (err) {
      showToast('Error al cargar categorías: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({ nombre: cat.nombre, descripcion: cat.descripcion || '' });
    } else {
      setEditingCategory(null);
      setFormData({ nombre: '', descripcion: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      showToast('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      if (editingCategory) {
        await api.categorias.update(editingCategory.id, formData);
        showToast('Categoría actualizada');
      } else {
        await api.categorias.create(formData);
        showToast('Categoría creada exitosamente');
      }
      setIsModalOpen(false);
      loadCategorias();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.categorias.remove(id);
      showToast('Categoría eliminada');
      loadCategorias();
    } catch (err) {
      showToast('Error al eliminar: ' + err.message);
    }
  };

  if (loading) return <div className="p-4 text-secondary">Cargando categorías...</div>;

  return (
    <div>
      {/* Notificación flotante */}
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

      {/* Botón Nueva Categoría */}
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Nueva categoría
        </button>
      </div>

      {/* Tabla de Categorías */}
      <div className="card bg-body-tertiary border-secondary">
        <div className="card-body p-0">
          {categorias.length === 0 ? (
            <div className="p-4 text-center text-secondary">No hay categorías registradas aún.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-semibold text-warning">{c.nombre}</td>
                      <td className="text-secondary">{c.descripcion || '—'}</td>
                      <td className="text-end text-nowrap">
                        <button
                          className="btn btn-outline-warning btn-sm me-2"
                          onClick={() => handleOpenModal(c)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteCategory(c.id)}
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

      {/* Modal para Crear / Editar Categoría */}
      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-body-tertiary border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-warning">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
              </div>
              <form onSubmit={handleSaveCategory}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="cat-nombre">Nombre *</label>
                    <input
                      type="text"
                      id="cat-nombre"
                      className="form-control"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="cat-desc">Descripción</label>
                    <textarea
                      id="cat-desc"
                      className="form-control"
                      rows="3"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-outline-light" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar
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