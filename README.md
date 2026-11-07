# Voltyx — Sistema de inventario y compras

Sistema web de gestión de inventario y compras orientado a pequeños negocios, como almacenes, bodegas, talleres y tiendas.

Voltyx permite administrar productos, categorías, proveedores, compras y movimientos de inventario mediante una interfaz web conectada a una API REST.

## 1. Funcionalidades principales

- Gestión de productos: creación, edición, búsqueda y baja lógica.
- Gestión de categorías y asociación con productos.
- Gestión de proveedores.
- Registro de compras con múltiples productos.
- Actualización automática del stock al registrar compras.
- Anulación de compras y reversión del stock.
- Registro de entradas, salidas y ajustes de inventario.
- Validación para impedir que el stock quede negativo.
- Historial de movimientos con fecha, producto, cantidad y motivo.
- Alertas de reposición según el stock mínimo.
- Dashboard con indicadores de inventario y compras.
- Búsqueda rápida de productos por nombre o código SKU.

## 2. Tecnologías utilizadas

| Componente | Tecnología |
|---|---|
| Frontend | React 19 |
| Entorno frontend | Vite |
| Estilos | Bootstrap 5.3 y CSS personalizado |
| Backend | NestJS y TypeScript |
| Base de datos relacional | MySQL 8.4 |
| Base de datos documental | MongoDB 8.0 |
| ODM | Mongoose |
| ORM | TypeORM |
| Validaciones | class-validator |
| Pruebas | Vitest |

## 3. Arquitectura del proyecto

El sistema está separado en dos aplicaciones:

- **Frontend:** interfaz desarrollada con React que consume la API mediante peticiones HTTP.
- **Backend:** API REST desarrollada con NestJS que administra la lógica de negocio y las conexiones a las bases de datos.

MySQL almacena los datos relacionales del inventario, mientras que MongoDB almacena eventos documentales relacionados con las operaciones de inventario.

### Estructura de carpetas

```text
Voltyx/
├── backend-nest/
│   ├── src/
│   │   ├── productos/
│   │   ├── categorias/
│   │   ├── proveedores/
│   │   ├── compras/
│   │   ├── movimientos/
│   │   ├── eventos-inventario/
│   │   └── dashboard/
│   ├── sql/
│   │   └── schema-mysql.sql
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── index.html
│   └── package.json
│
├── .env.ejemplo
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 4. Requisitos previos

Para ejecutar el proyecto se necesita:

- Node.js y npm.
- MySQL 8.4 o compatible.
- MongoDB 8.0 o compatible.
- Git.
- Docker Desktop y Docker Compose, si se elige ejecutar las bases de datos mediante contenedores.

## 5. Configuración de las bases de datos

Voltyx utiliza dos bases de datos.

### MySQL

MySQL almacena:

- Categorías.
- Productos.
- Proveedores.
- Compras.
- Detalles de compras.
- Movimientos de inventario.

El esquema se encuentra en:

`backend-nest/sql/schema-mysql.sql`

La base de datos utilizada se llama `voltyx`.

### MongoDB

MongoDB almacena eventos documentales de inventario, incluyendo compras, entradas, salidas y ajustes.

La conexión se configura mediante `MONGO_URI`.

## 6. Configuración de variables de entorno

### Backend

Crear el archivo:

`backend-nest/.env`

Tomando como referencia `backend-nest/.env.example`.

Contenido de referencia:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3307
MYSQL_DATABASE=voltyx
MYSQL_USER=voltyx_user
MYSQL_PASSWORD=CAMBIAR_PASSWORD_USUARIO

MONGO_URI=mongodb://127.0.0.1:27017/voltyx
```

Los valores deben ajustarse a las credenciales y puertos de las instalaciones utilizadas.

### Docker Compose

El archivo `docker-compose.yml` utiliza las variables del archivo `.env` ubicado en la raíz del proyecto.

Crear ese archivo copiando `.env.ejemplo` y configurar las credenciales correspondientes.

**Importante:** el puerto de MySQL publicado por Docker es 3307, mientras que dentro del contenedor MySQL utiliza el puerto 3306.

No subir archivos `.env` con contraseñas reales al repositorio.

## 7. Instalación

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
cd Voltyx
```

Instalar las dependencias del backend:

```bash
cd backend-nest
npm install
```

Instalar las dependencias del frontend:

```bash
cd ../frontend
npm install
```

## 8. Ejecución del proyecto

### Iniciar las bases de datos

Si se utiliza Docker Compose, desde la raíz:

```bash
docker compose up -d
```

Si se utilizan instalaciones locales, iniciar MySQL y MongoDB por separado.

Antes de iniciar NestJS, verificar que la base de datos MySQL exista y tenga las tablas creadas utilizando el esquema SQL del proyecto.

### Iniciar el backend

Desde `backend-nest`:

```bash
npm run start:dev
```

El backend estará disponible en:

`http://localhost:3000`

### Iniciar el frontend

Desde `frontend`, en otra terminal:

```bash
npm run dev
```

El frontend estará disponible en:

`http://localhost:5173`

Vite utiliza un proxy para redirigir las peticiones `/api` hacia el backend NestJS.

## 9. Endpoints principales

La API utiliza las siguientes rutas:

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/productos` | Listar productos |
| POST | `/productos` | Crear producto |
| GET | `/productos/:id` | Consultar producto |
| PATCH | `/productos/:id` | Actualizar producto |
| DELETE | `/productos/:id` | Dar de baja producto |
| GET | `/categorias` | Listar categorías |
| POST | `/categorias` | Crear categoría |
| GET | `/proveedores` | Listar proveedores |
| POST | `/proveedores` | Crear proveedor |
| GET | `/compras` | Listar compras |
| POST | `/compras` | Registrar compra |
| POST | `/compras/:id/anular` | Anular compra |
| GET | `/movimientos` | Consultar movimientos |
| POST | `/movimientos` | Registrar movimiento |
| GET | `/eventos-inventario` | Consultar eventos de inventario |
| GET | `/dashboard` | Consultar indicadores del dashboard |

Las peticiones realizadas desde el frontend utilizan el prefijo `/api`, que Vite elimina mediante su configuración de proxy.

## 10. Pruebas y compilación

### Backend

Ejecutar las pruebas automatizadas:

```bash
npm test
```

Compilar el backend:

```bash
npm run build
```

### Frontend

Compilar el frontend:

```bash
npm run build
```

## 11. Consideraciones

- El stock no se modifica directamente desde la edición de productos: se administra mediante movimientos y compras.
- El sistema impide registrar salidas que superen las existencias disponibles.
- Las compras pueden anularse, siempre que exista stock suficiente para revertirlas.
- Los eventos de inventario se almacenan en MongoDB después de confirmar la operación en MySQL.
- La sincronización automática de entidades de TypeORM está desactivada (`synchronize: false`).

## 12. Mejoras futuras

- Lectura de códigos QR o códigos de barras mediante cámara.
- Autenticación de usuarios y roles.
- Exportación de informes a PDF y Excel.
- Funcionalidades adicionales de reportes y análisis de inventario.

---

**Voltyx — Proyecto de desarrollo web, 2026.**