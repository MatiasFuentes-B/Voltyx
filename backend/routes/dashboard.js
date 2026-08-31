const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const totalProductos = db.prepare('SELECT COUNT(*) AS n FROM productos WHERE activo = 1').get().n;
  const productosBajoStock = db.prepare(
    'SELECT COUNT(*) AS n FROM productos WHERE activo = 1 AND stock_actual <= stock_minimo'
  ).get().n;
  const valorInventario = db.prepare(
    'SELECT COALESCE(SUM(stock_actual * precio_compra), 0) AS v FROM productos WHERE activo = 1'
  ).get().v;
  const comprasMes = db.prepare(`
    SELECT COALESCE(SUM(total), 0) AS v, COUNT(*) AS n FROM compras
    WHERE estado != 'anulada' AND strftime('%Y-%m', fecha) = strftime('%Y-%m', 'now')
  `).get();
  const totalProveedores = db.prepare('SELECT COUNT(*) AS n FROM proveedores').get().n;

  const alertas = db.prepare(`
    SELECT id, nombre, codigo, stock_actual, stock_minimo
    FROM productos WHERE activo = 1 AND stock_actual <= stock_minimo
    ORDER BY (stock_minimo - stock_actual) DESC
  `).all();

  const ultimosMovimientos = db.prepare(`
    SELECT m.*, p.nombre AS producto_nombre FROM movimientos m
    JOIN productos p ON p.id = m.producto_id
    ORDER BY m.fecha DESC, m.id DESC LIMIT 8
  `).all();

  res.json({
    total_productos: totalProductos,
    productos_bajo_stock: productosBajoStock,
    valor_inventario: valorInventario,
    compras_mes_total: comprasMes.v,
    compras_mes_cantidad: comprasMes.n,
    total_proveedores: totalProveedores,
    alertas_reposicion: alertas,
    ultimos_movimientos: ultimosMovimientos,
  });
});

module.exports = router;
