# VOLTYX — Inventario y Compras para pequeños negocios

Sistema web de **inventario + compras** pensado para almacenes, talleres, VOLTYXs
y tiendas pequeñas. Proyecto de desarrollo web (semestre 2026).

## Cobertura de requisitos del proyecto

| Requisito pedido | Dónde está implementado |
|---|---|
| Productos | CRUD completo (`/api/productos`, vista **Productos**) |
| Categorías | CRUD completo (`/api/categorias`, vista **Categorias**) |
| Stock | Campo `stock_actual` por producto, se recalcula automáticamente |
| Movimientos | Tabla `movimientos` + vista **Movimientos** (historial completo) |
| Proveedores | CRUD completo (`/api/proveedores`, vista **Proveedores**) |
| Compras | Registro de compra con múltiples ítems (`/api/compras`) |
| Detalle de compra | Tabla `detalle_compra`, ligada a cada compra |
| Stock mínimo | Campo `stock_minimo` por producto, genera alertas |
| Entradas/salidas auditables | Todo movimiento de stock (compra, venta, ajuste) queda registrado con fecha y motivo, nunca se edita el stock "a mano" sin dejar rastro |
| Alertas de reposición | Tarjeta en el Dashboard + filtro "Solo bajo stock" en Productos |
| Historial | Vista **Movimientos**, y detalle de movimientos por producto |
| Dashboard | Vista **Dashboard**: total productos, bajo stock, valor de inventario, compras del mes, últimos movimientos |
| Búsqueda rápida | Buscador en la topbar (filtra por nombre o código) |
| Lectura QR/código (extensión) | Cada producto tiene un campo `codigo` (SKU) pensado para escanearse; la lectura de cámara queda como mejora futura (ver abajo) |

**Modelo comercial** (licencia/suscripción, crecer hacia POS) es una decisión de
negocio para cuando el proyecto se ofrezca a clientes reales; no es parte del
código, pero la arquitectura (API REST separada del frontend) permite agregar
autenticación y multi-tenant sin reescribir nada.

## Stack técnico

- **Backend:** Node.js + Express + SQLite (`better-sqlite3`) — sin necesidad de
  instalar un servidor de base de datos aparte, ideal para desarrollo y para
  presentar el proyecto.
- **Frontend:** HTML + CSS + JavaScript vanilla (sin build step), consume la
  API vía `fetch`. Así no necesitas instalar Node para ver el frontend: el
  propio backend lo sirve.
- **Base de datos:** SQLite, esquema en `backend/db/schema.sql`.

## Estructura del proyecto

```
inventario-app/
├── backend/
│   ├── db/
│   │   ├── schema.sql       # definición de tablas
│   │   ├── index.js         # conexión + carga del esquema
│   │   └── seed.js          # datos de ejemplo
│   ├── routes/
│   │   ├── productos.js
│   │   ├── categorias.js
│   │   ├── proveedores.js
│   │   ├── compras.js
│   │   ├── movimientos.js
│   │   └── dashboard.js
│   ├── server.js            # servidor Express (API + sirve el frontend)
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── css/styles.css
│   └── js/{api.js, app.js}
├── .gitignore
└── README.md
```

## Cómo correrlo localmente

Requisitos: [Node.js](https://nodejs.org) 18 o superior.

```bash
cd backend
npm install       # instala dependencias
npm run seed      # (opcional) carga datos de ejemplo
npm start         # levanta la API + frontend en http://localhost:4000
```

Abre `http://localhost:4000` en el navegador. La API queda disponible en
`http://localhost:4000/api/...`.

Para desarrollo con recarga automática: `npm run dev` (usa `nodemon`).

## Endpoints principales de la API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/dashboard` | Métricas + alertas de reposición |
| GET | `/api/productos?q=&categoria_id=&bajo_stock=true` | Listar/buscar productos |
| POST | `/api/productos` | Crear producto |
| PUT/DELETE | `/api/productos/:id` | Editar / dar de baja producto |
| GET/POST | `/api/categorias` | Listar / crear categoría |
| GET/POST | `/api/proveedores?q=` | Listar / crear proveedor |
| GET/POST | `/api/compras` | Listar / registrar compra (con ítems) |
| POST | `/api/compras/:id/anular` | Anular compra y revertir stock |
| GET/POST | `/api/movimientos?producto_id=` | Historial / registrar movimiento manual |

## Subir este proyecto a GitHub

Ya está inicializado como repositorio Git local. Solo falta conectarlo a
GitHub:

1. Crea un repositorio nuevo y **vacío** en GitHub (sin README, sin
   `.gitignore`) — por ejemplo `inventario-VOLTYX`.
2. En esta carpeta, ejecuta:

```bash
git remote add origin https://github.com/TU_USUARIO/inventario-VOLTYX.git
git branch -M main
git push -u origin main
```

Reemplaza `TU_USUARIO` y el nombre del repo por los tuyos. Si usas SSH en vez
de HTTPS, usa la URL `git@github.com:TU_USUARIO/inventario-VOLTYX.git`.

## Próximos pasos sugeridos (para nota extra)

- Lectura de código QR/barras con la cámara (librería `html5-qrcode` en el
  frontend, ya hay un campo `codigo` listo para eso).
- Autenticación de usuarios (login) y roles (admin / bodeguero).
- Exportar reportes de compras y movimientos a PDF o Excel.
- Migrar a PostgreSQL si el negocio crece y necesita varios usuarios
  concurrentes.
