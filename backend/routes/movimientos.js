const router = require('express').Router();
const db = require('../db');


router.get('/', (req, res) => {
  const { producto_id } = req.query;
  let sql = `SELECT m.*, p.nombre AS producto_nombre FROM movimientos m
             JOIN productos p ON p.id = m.producto_id`;
  const params = [];
  if (producto_id) {
    sql += ' WHERE m.producto_id = ?';
    params.push(producto_id);
  }
  sql += ' ORDER BY m.fecha DESC, m.id DESC LIMIT 200';
  res.json(db.prepare(sql).all(...params));
});


router.post('/', (req, res) => {
  const { producto_id, tipo, cantidad, motivo } = req.body;

  if (!producto_id || !tipo || !cantidad) {
    return res.status(400).json({ error: 'producto_id, tipo y cantidad son requeridos' });
  }
  if (!['entrada', 'salida', 'ajuste'].includes(tipo)) {
    return res.status(400).json({ error: "tipo debe ser 'entrada', 'salida' o 'ajuste'" });
  }
  if (cantidad <= 0) {
    return res.status(400).json({ error: 'cantidad debe ser mayor a 0' });
  }

  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(producto_id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  if (tipo === 'salida' && cantidad > producto.stock_actual) {
    return res.status(400).json({ error: `Stock insuficiente. Stock actual: ${producto.stock_actual}` });
  }

  const registrar = db.transaction(() => {
    const delta = tipo === 'salida' ? -cantidad : cantidad;
    db.prepare('UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?').run(delta, producto_id);
    return db.prepare('INSERT INTO movimientos (producto_id, tipo, cantidad, motivo) VALUES (?, ?, ?, ?)')
      .run(producto_id, tipo, cantidad, motivo || null);
  });

  const info = registrar();
  const nuevoProducto = db.prepare('SELECT * FROM productos WHERE id = ?').get(producto_id);
  res.status(201).json({
    movimiento: db.prepare('SELECT * FROM movimientos WHERE id = ?').get(info.lastInsertRowid),
    producto: nuevoProducto,
  });
});

module.exports = router;
