import { useState, useEffect } from 'react';
import api from '../api.js';

export default function StockMovesView() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');

  const fmtDate = (iso) => (iso ? iso.replace('T', ' ').slice(0, 16) : '—');

  useEffect(() => {
    api.movimientos
      .list()
      .then((data) => {
        setMovimientos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = movimientos.filter((m) => {
    return filtroTipo === '' || m.tipo === filtroTipo;
  });

  if (loading) return <div className="p-4 text-secondary">Cargando historial de movimientos...</div>;

  return (
    <div>
      {/* Filtro por tipo de movimiento */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <select
          className="form-select form-select-sm w-auto bg-body-tertiary border-secondary text-light"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="entrada">Entradas</option>
          <option value="salida">Salidas</option>
          <option value="ajuste">Ajustes</option>
        </select>
        <span className="text-secondary small">Total movimientos: {filtered.length}</span>
      </div>

      {/* Tabla de Movimientos */}
      <div className="card bg-body-tertiary border-secondary">
        <div className="card-body p-0">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-secondary">Sin movimientos registrados.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id}>
                      <td className="mono text-secondary small">
                        {fmtDate(m.fecha)}
                      </td>
                      <td className="fw-semibold text-warning">
                        {m.producto?.nombre || '-'}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            m.tipo === 'entrada'
                              ? 'bg-success'
                              : m.tipo === 'salida'
                              ? 'bg-danger'
                              : 'bg-secondary'
                          }`}
                        >
                          {m.tipo}
                        </span>
                      </td>
                      <td className="mono fw-bold fs-6">{m.cantidad}</td>
                      <td className="text-secondary">{m.motivo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}