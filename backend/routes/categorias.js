const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM categorias ORDER BY nombre').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM categorias WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Categoria no encontrada' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });
  try {
    const info = db.prepare('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)').run(nombre, descripcion || null);
    res.status(201).json(db.prepare('SELECT * FROM categorias WHERE id = ?').get(info.lastInsertRowid));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  const { nombre, descripcion } = req.body;
  const info = db.prepare('UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?')
    .run(nombre, descripcion || null, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Categoria no encontrada' });
  res.json(db.prepare('SELECT * FROM categorias WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM categorias WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Categoria no encontrada' });
  res.status(204).end();
});

module.exports = router;
