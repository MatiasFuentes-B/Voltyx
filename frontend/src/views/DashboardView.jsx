import { useState, useEffect } from 'react';
import api from '../api.js';
import StatCard from '../components/StatCard.jsx';
import StockGauge from '../components/StockGauge.jsx';

export default function DashboardView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formato chileno de moneda ($1.250.000)
  const money = (n) => '$' + Math.round(n || 0).toLocaleString('es-CL');

  useEffect(() => {
    // Al cargarse la vista, llamamos a la API
    api.dashboard()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-secondary">Cargando métricas de bodega...</div>;
  if (error) return <div className="alert alert-danger">Error al conectar con la API: {error}</div>;
  if (!data) return null;

  return (
    <>
      {/* 4 StatCards reutilizables alimentadas por Props */}
      <div className="row g-3 mb-4">
        <StatCard
          label="Productos activos"
          value={data.total_productos}
        />
        <StatCard
          label="Bajo stock mínimo"
          value={data.productos_bajo_stock}
          isAlert={data.productos_bajo_stock > 0}
        />
        <StatCard
          label="Valor de inventario"
          value={money(data.valor_inventario)}
        />
        <StatCard
          label="Compras este mes"
          value={money(data.compras_mes_total)}
        />
      </div>

      {/* Tablas de Alertas y Movimientos */}
      <div className="row g-3">
        {/* Alertas de reposición */}
        <div className="col-12 col-lg-7">
          <div className="card bg-body-tertiary h-100">
            <div className="card-body">
              <h2 className="fs-5 border-bottom border-secondary pb-2 mb-3 text-warning">
                Alertas de reposición
              </h2>
              {data.alertas_reposicion.length === 0 ? (
                <div className="text-secondary p-3">Sin alertas — todo el stock está sobre el mínimo.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Código</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.alertas_reposicion.map((a) => (
                        <tr key={a.id}>
                          <td>{a.nombre}</td>
                          <td className="mono text-secondary">{a.codigo || '—'}</td>
                          <td>
                            <StockGauge actual={a.stock_actual} minimo={a.stock_minimo} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Últimos movimientos */}
        <div className="col-12 col-lg-5">
          <div className="card bg-body-tertiary h-100">
            <div className="card-body">
              <h2 className="fs-5 border-bottom border-secondary pb-2 mb-3 text-warning">
                Últimos movimientos
              </h2>
              {data.ultimos_movimientos.length === 0 ? (
                <div className="text-secondary p-3">Sin movimientos registrados aún.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Tipo</th>
                        <th>Cant.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.ultimos_movimientos.map((m) => (
                        <tr key={m.id}>
                          <td>{m.producto_nombre}</td>
                          <td>
                            <span className={`badge ${m.tipo === 'compra' ? 'bg-success' : 'bg-secondary'}`}>
                              {m.tipo}
                            </span>
                          </td>
                          <td className="mono fw-bold">{m.cantidad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}