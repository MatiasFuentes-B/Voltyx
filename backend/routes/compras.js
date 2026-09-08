const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT c.*, pr.nombre AS proveedor_nombre
    FROM compras c LEFT JOIN proveedores pr ON pr.id = c.proveedor_id
    ORDER BY c.fecha DESC, c.id DESC
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const compra = db.prepare(`
    SELECT c.*, pr.nombre AS proveedor_nombre
    FROM compras c LEFT JOIN proveedores pr ON pr.id = c.proveedor_id
    WHERE c.id = ?
  `).get(req.params.id);
  if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });

  const detalle = db.prepare(`
    SELECT dc.*, p.nombre AS producto_nombre
    FROM detalle_compra dc JOIN productos p ON p.id = dc.producto_id
    WHERE dc.compra_id = ?
  `).all(req.params.id);

  res.json({ ...compra, detalle });
});


router.post('/', (req, res) => {
  const { proveedor_id, nota, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items debe ser un arreglo con al menos un producto' });
  }
  for (const it of items) {
    if (!it.producto_id || !it.cantidad || it.cantidad <= 0) {
      return res.status(400).json({ error: 'Cada item requiere producto_id y cantidad > 0' });
    }
  }

  const crearCompra = db.transaction(() => {
    const total = items.reduce((acc, it) => acc + it.cantidad * (it.precio_unitario || 0), 0);

    const compraInfo = db.prepare(
      'INSERT INTO compras (proveedor_id, estado, total, nota) VALUES (?, ?, ?, ?)'
    ).run(proveedor_id || null, 'recibida', total, nota || null);
    const compraId = compraInfo.lastInsertRowid;

    const insertDetalle = db.prepare(
      'INSERT INTO detalle_compra (compra_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)'
    );
    const sumarStock = db.prepare('UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?');
    const insertMovimiento = db.prepare(
      'INSERT INTO movimientos (producto_id, tipo, cantidad, motivo, referencia_id) VALUES (?, ?, ?, ?, ?)'
    );

    for (const it of items) {
      const subtotal = it.cantidad * (it.precio_unitario || 0);
      insertDetalle.run(compraId, it.producto_id, it.cantidad, it.precio_unitario || 0, subtotal);
      sumarStock.run(it.cantidad, it.producto_id);
      insertMovimiento.run(it.producto_id, 'entrada', it.cantidad, `Compra #${compraId}`, compraId);
    }

    return compraId;
  });

  const compraId = crearCompra();
  const detalle = db.prepare(`
    SELECT dc.*, p.nombre AS producto_nombre FROM detalle_compra dc
    JOIN productos p ON p.id = dc.producto_id WHERE dc.compra_id = ?
  `).all(compraId);
  const compra = db.prepare('SELECT * FROM compras WHERE id = ?').get(compraId);

  res.status(201).json({ ...compra, detalle });
});

// Anular una compra: revierte el stock que habia sumado y marca la compra como anulada.
router.post('/:id/anular', (req, res) => {
  const compra = db.prepare('SELECT * FROM compras WHERE id = ?').get(req.params.id);
  if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
  if (compra.estado === 'anulada') return res.status(400).json({ error: 'La compra ya esta anulada' });

  const detalle = db.prepare('SELECT * FROM detalle_compra WHERE compra_id = ?').all(req.params.id);

  const anular = db.transaction(() => {
    const restarStock = db.prepare('UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?');
    const insertMovimiento = db.prepare(
      'INSERT INTO movimientos (producto_id, tipo, cantidad, motivo, referencia_id) VALUES (?, ?, ?, ?, ?)'
    );
    for (const d of detalle) {
      restarStock.run(d.cantidad, d.producto_id);
      insertMovimiento.run(d.producto_id, 'salida', d.cantidad, `Anulacion compra #${compra.id}`, compra.id);
    }
    db.prepare("UPDATE compras SET estado = 'anulada' WHERE id = ?").run(req.params.id);
  });
  anular();

  res.json(db.prepare('SELECT * FROM compras WHERE id = ?').get(req.params.id));
});

module.exports = router;
