const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

require('./db'); 

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/movimientos', require('./routes/movimientos'));
app.use('/api/compras', require('./routes/compras'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/', (req, res) => {
  res.redirect('http://localhost:3000');
});

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API + frontend corriendo en http://localhost:${PORT}`);
});
