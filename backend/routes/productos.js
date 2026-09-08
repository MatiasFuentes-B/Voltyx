const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { q, categoria_id, bajo_stock } = req.query;
  let sql = `SELECT p.*, c.nombre AS categoria_nombre
             FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id
             WHERE p.activo = 1`;
  const params = [];

  if (q) {
    sql += ' AND (p.nombre LIKE ? OR p.codigo LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  if (categoria_id) {
    sql += ' AND p.categoria_id = ?';
    params.push(categoria_id);
  }
  if (bajo_stock === 'true') {
    sql += ' AND p.stock_actual <= p.stock_minimo';
  }
  sql += ' ORDER BY p.nombre';

  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', (req, res) => {
  const row = db.prepare(
    `SELECT p.*, c.nombre AS categoria_nombre FROM productos p
     LEFT JOIN categorias c ON c.id = p.categoria_id WHERE p.id = ?`
  ).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { nombre, descripcion, codigo, categoria_id, precio_compra, precio_venta, stock_actual, stock_minimo } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });
  try {
    const info = db.prepare(`INSERT INTO productos
      (nombre, descripcion, codigo, categoria_id, precio_compra, precio_venta, stock_actual, stock_minimo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      nombre, descripcion || null, codigo || null, categoria_id || null,
      precio_compra || 0, precio_venta || 0, stock_actual || 0, stock_minimo || 0
    );
    if (stock_actual && stock_actual > 0) {
      db.prepare('INSERT INTO movimientos (producto_id, tipo, cantidad, motivo) VALUES (?, ?, ?, ?)')
        .run(info.lastInsertRowid, 'entrada', stock_actual, 'Stock inicial');
    }
    res.status(201).json(db.prepare('SELECT * FROM productos WHERE id = ?').get(info.lastInsertRowid));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  const { nombre, descripcion, codigo, categoria_id, precio_compra, precio_venta, stock_minimo, activo } = req.body;
  const info = db.prepare(`UPDATE productos SET
    nombre=?, descripcion=?, codigo=?, categoria_id=?, precio_compra=?, precio_venta=?, stock_minimo=?, activo=?
    WHERE id=?`
  ).run(
    nombre, descripcion || null, codigo || null, categoria_id || null,
    precio_compra || 0, precio_venta || 0, stock_minimo || 0,
    activo === undefined ? 1 : (activo ? 1 : 0), req.params.id
  );
  if (info.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  
  const info = db.prepare('UPDATE productos SET activo = 0 WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
  res.status(204).end();
});

module.exports = router;
