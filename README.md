Voltyx — Inventario y Compras para pequeños negocios

Sistema web de inventario + compras pensado para almacenes, talleres, bodegas y tiendas pequeñas. Proyecto de desarrollo web (semestre 2026).

Cobertura de requisitos del proyecto
Requisito pedido	Dónde está implementado
Productos	CRUD completo (/api/productos, vista Productos)
Categorías	CRUD completo (/api/categorias, vista Categorías)
Stock	Campo stock_actual por producto, se recalcula automáticamente
Movimientos	Tabla movimientos + vista Movimientos (historial completo)
Proveedores	CRUD completo (/api/proveedores, vista Proveedores)
Compras	Registro de compra con múltiples ítems (/api/compras)
Detalle de compra	Tabla detalle_compra, ligada a cada compra
Stock mínimo	Campo stock_minimo por producto, genera alertas
Entradas/salidas auditables	Todo movimiento de stock (compra, venta, ajuste) queda registrado con fecha y motivo, nunca se edita el stock "a mano" sin dejar rastro
Alertas de reposición	Tarjeta en el Dashboard + filtro "Solo bajo stock" en Productos
Historial	Vista Movimientos, y detalle de movimientos por producto
Dashboard	Vista Dashboard: total productos, bajo stock, valor de inventario, compras del mes, últimos movimientos
Búsqueda rápida	Buscador reactivo en la topbar (filtra por nombre o código en vivo)
Lectura QR/código (extensión)	Cada producto tiene un campo codigo (SKU) pensado para escanearse; la lectura de cámara queda como mejora futura (ver abajo)

Modelo comercial (licencia/suscripción, crecer hacia POS) es una decisión de negocio para cuando el proyecto se ofrezca a clientes reales; no es parte del código, pero la arquitectura (API REST separada del frontend) permite agregar autenticación y multi-tenant sin reescribir nada.

Stack técnico
Backend: Node.js + Express + SQLite nativo (node:sqlite) — sin necesidad de instalar un servidor de base de datos aparte ni dependencias binarias en C++, ideal para desarrollo portátil y para presentar el proyecto.

Frontend: React 19 + Vite + Bootstrap 5.3 + CSS personalizado. Diseñado bajo la arquitectura de componentes, props y estado. Consume la API vía fetch asíncrono con proxy de desarrollo configurado en Vite.
Base de datos: SQLite, esquema en backend/db/schema.sql.

Por qué estas decisiones técnicas
Bootstrap 5 en vez de un framework CSS propio desde cero: se usa el sistema de grillas (row/col) para el layout responsive, componentes (card, table, modal, btn, form-control) y utilidades (d-flex, gap, text-end, etc). El archivo frontend/css/styles.css no reemplaza a Bootstrap: sobreescribe sus variables CSS (--bs-primary, --bs-body-bg, etc.) para aplicar la identidad visual del proyecto (paleta oscura + amarillo de bodega) sin pelear contra el framework. Esto es más mantenible que escribir grid y componentes desde cero, y sigue siendo responsive sin media queries manuales para la mayoría de los casos.
Arquitectura de Componentes React (Semana 6): la interfaz se divide en piezas con responsabilidades claras. Componentes reutilizables como StatCard y StockGauge reciben datos dinámicos mediante props. Se aplica Lifting State Up en App.jsx para que el buscador de la Topbar controle el filtrado reactivo de ProductsView.
Formularios controlados con validación: se combinan campos controlados por estado (useState) con validaciones nativas (required, min="0", type="number") y retroalimentación visual mediante clases de Bootstrap y alertas Toast accesibles.
SQLite nativo (node:sqlite) en vez de librerías externas: se aprovecha el módulo integrado en Node.js moderno, evitando problemas de compilación en Windows con node-gyp o Python, garantizando que el proyecto corra en cualquier máquina de forma inmediata.
Vite como entorno de desarrollo: compilación instantánea mediante Hot Module Replacement (HMR) y proxy inverso para llamadas /api, eliminando cualquier problema de CORS durante el desarrollo local.

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
   `.gitignore`) — por ejemplo `inventario-bodega`.
2. En esta carpeta, ejecuta:

```bash
git remote add origin https://github.com/TU_USUARIO/inventario-bodega.git
git branch -M main
git push -u origin main
```

Reemplaza `TU_USUARIO` y el nombre del repo por los tuyos. Si usas SSH en vez
de HTTPS, usa la URL `git@github.com:TU_USUARIO/inventario-bodega.git`.

## Próximos pasos sugeridos (para nota extra)

- Lectura de código QR/barras con la cámara (librería `html5-qrcode` en el
  frontend, ya hay un campo `codigo` listo para eso).
- Autenticación de usuarios (login) y roles (admin / bodeguero).
- Exportar reportes de compras y movimientos a PDF o Excel.
- Migrar a PostgreSQL si el negocio crece y necesita varios usuarios
  concurrentes.
