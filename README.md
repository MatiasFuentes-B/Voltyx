Voltyx — Sistema de inventario y compras
Sistema web de gestión de inventario y compras orientado a pequeños negocios, como almacenes, bodegas, talleres y tiendas.

Voltyx permite administrar productos, categorías, proveedores, compras y movimientos de inventario mediante una interfaz web conectada a una API REST.
1. Funcionalidades principales
- Gestión de productos: creación, edición, búsqueda y baja lógica.
- Gestión de categorías y asociación con productos.
- Gestión de proveedores.
- Registro de compras con múltiples productos.
- Actualización automática del stock al registrar compras.
- Anulación de compras y reversión del stock.
- Registro de entradas, salidas y ajustes de inventario.
- Registro de eventos de auditoría para creación, modificación y eliminación de productos, categorías y proveedores.
- Validación para impedir que el stock quede negativo.
- Historial de movimientos con fecha, producto, cantidad y motivo.
- Alertas de reposición según el stock mínimo.
- Dashboard con indicadores de inventario y compras.
- Búsqueda rápida de productos por nombre o código SKU.
2. Tecnologías utilizadas
Componente	Tecnología
Frontend	React 19
Entorno frontend	Vite
Estilos	Bootstrap 5.3 y CSS personalizado
Backend	NestJS y TypeScript
Base de datos relacional	MySQL 8.4
Base de datos documental	MongoDB 8.0
ODM	Mongoose
ORM	TypeORM
Validaciones	class-validator
Pruebas automatizadas	Vitest
Documentación de API	Swagger


3. Arquitectura del proyecto
El sistema está separado en dos aplicaciones:
- Frontend: interfaz desarrollada con React que consume la API mediante peticiones HTTP.
- Backend: API REST desarrollada con NestJS que administra la lógica de negocio y las conexiones a las bases de datos.
MySQL almacena los datos relacionales del inventario, mientras que MongoDB almacena eventos documentales relacionados con las operaciones de inventario.
Estructura de carpetas
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
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── index.html
│   └── package.json
│
├── Mongo/
│   └── verificacion-consulta.js
├── .env.ejemplo
├── docker-compose.yml
├── .gitignore
└── README.md
4. Requisitos previos
Para ejecutar el proyecto se necesita:
- Node.js y npm.
- MySQL 8.4 o compatible.
- MongoDB 8.0 o compatible.
- Git.
- Docker Desktop y Docker Compose, si se elige ejecutar las bases de datos mediante contenedores.
5. Configuración de las bases de datos
Voltyx utiliza dos bases de datos.
MySQL
MySQL almacena:
- Categorías.
- Productos.
- Proveedores.
- Compras.
- Detalles de compras.
- Movimientos de inventario.
El esquema se encuentra en:

backend-nest/sql/schema-mysql.sql

La base de datos utilizada se llama voltyx.
MongoDB
MongoDB almacena eventos documentales relacionados con las operaciones del inventario. Se registran eventos de creación, modificación y desactivación de productos, creación, modificación y eliminación de categorías y proveedores, además de eventos relacionados con compras y movimientos.

La conexión se configura mediante MONGO_URI. Los eventos se guardan después de confirmar la operación correspondiente en MySQL. Por este motivo, las dos bases de datos no comparten una única transacción: si MongoDB no está disponible, una operación que ya se guardó en MySQL puede quedar sin su registro de auditoría.
6. Configuración de variables de entorno
Backend
Crear el archivo:

backend-nest/.env

Se puede tomar como referencia el archivo .env.ejemplo que está en la raíz del proyecto. Copiar sus variables al archivo backend-nest/.env y ajustar los valores según las instalaciones locales. El backend carga las variables desde su configuración de entorno.

Contenido de referencia:
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3307
MYSQL_DATABASE=voltyx
MYSQL_USER=voltyx_user
MYSQL_PASSWORD=CAMBIAR_PASSWORD_USUARIO

MONGO_URI=mongodb://127.0.0.1:27017/voltyx
Los valores deben ajustarse a las credenciales y puertos de las instalaciones utilizadas.
Docker Compose
El archivo docker-compose.yml utiliza las variables del archivo .env ubicado en la raíz del proyecto. Para usarlo, crear ese archivo copiando .env.ejemplo y configurar las credenciales correspondientes.

Si se trabaja con MySQL y MongoDB instalados localmente, no es necesario iniciar Docker Compose. En ese caso, configurar MYSQL_HOST, MYSQL_PORT y MONGO_URI de acuerdo con los puertos de los servicios locales.

Importante: el puerto de MySQL publicado por Docker es 3307, mientras que dentro del contenedor MySQL utiliza el puerto 3306.

No subir archivos .env con contraseñas reales al repositorio.
7. Instalación
Clonar el repositorio:
git clone URL_DEL_REPOSITORIO
cd Voltyx
Instalar las dependencias del backend:
cd backend-nest
npm install
Instalar las dependencias del frontend:
cd ../frontend
npm install
8. Ejecución del proyecto
Iniciar las bases de datos
Si se utiliza Docker Compose, desde la raíz:
docker compose up -d
Si se utilizan instalaciones locales, iniciar MySQL y MongoDB por separado.

Antes de iniciar NestJS, verificar que la base de datos MySQL exista y tenga las tablas creadas utilizando el esquema SQL del proyecto.
Iniciar el backend
Desde backend-nest:
npm run start:dev
El backend estará disponible en:

http://localhost:3000
Iniciar el frontend
Desde frontend, en otra terminal:
npm run dev
El frontend estará disponible en:

http://localhost:5173

Vite utiliza un proxy para redirigir las peticiones /api hacia el backend NestJS.

8.1 Aplicación móvil (Expo / React Native)

La app móvil consume la misma API REST que el frontend web, por lo que ambos ven los mismos datos.

Requisitos
- Node.js y npm.
- Expo Go instalado en el celular.
- Backend corriendo en el PC ("npm run start:dev" en "backend-nest").
- El celular y el PC deben estar en la misma red WiFi.

Instalación y ejecución
cd mobile
npm install
Editar "mobile/src/config/api.ts" y dejar:
export const API_BASE_URL = 'http://IP_DEL_PC:3000';
(usar la IP local del PC, no "localhost"; en Expo aparece como "exp://IP:8081")
npx expo start -c
Escanear el QR con Expo Go.

 Funcionalidades móviles
- Dashboard: productos activos, bajo stock, valor de inventario, compras del mes, alertas de reposición y últimos movimientos.
- Productos: listar, crear (con categoría) y dar de baja.
- Proveedores: listar y crear.
- Movimientos: registrar entradas, salidas y ajustes con selector de producto.
- Compras: registrar compra (actualiza stock y dashboard) y anularla.

Flujo
App Expo → "voltyxApi.ts" (fetch) → API NestJS (DTOs con class-validator) → MySQL → el frontend web lee los mismos datos.

9. Endpoints principales
La API utiliza las siguientes rutas:
Método	Ruta	Descripción
GET	/productos	Listar productos (permite filtros por búsqueda, categoría y bajo stock)
POST	/productos	Crear producto
GET	/productos/:id	Consultar producto
PUT	/productos/:id	Actualizar producto
DELETE	/productos/:id	Dar de baja producto
GET	/categorias	Listar categorías
POST	/categorias	Crear categoría
GET	/categorias/:id	Consultar categoría
PUT	/categorias/:id	Actualizar categoría
DELETE	/categorias/:id	Eliminar categoría
GET	/proveedores	Listar proveedores
POST	/proveedores	Crear proveedor
GET	/proveedores/:id	Consultar proveedor
PUT	/proveedores/:id	Actualizar proveedor
DELETE	/proveedores/:id	Eliminar proveedor
GET	/compras	Listar compras
POST	/compras	Registrar compra
GET	/compras/:id	Consultar compra
POST	/compras/:id/anular	Anular compra
GET	/movimientos	Consultar movimientos
POST	/movimientos	Registrar movimiento
GET	/eventos-inventario	Consultar eventos de inventario
GET	/dashboard	Consultar indicadores del dashboard


La documentación interactiva de Swagger se encuentra en:

http://localhost:3000/api

Las rutas de los controladores se publican en el backend sin el prefijo /api. Las peticiones realizadas desde el frontend utilizan ese prefijo y Vite lo elimina mediante la configuración del proxy antes de enviarlas a NestJS.
10. Pruebas y compilación
Backend
Desde la carpeta backend-nest, ejecutar las pruebas automatizadas:
npm test
Para ejecutar las pruebas en modo de observación:
npm run test:watch
Compilar el backend:
npm run build
Frontend
Desde la carpeta frontend, compilar el frontend:
npm run build
11. Consideraciones
- El stock no se modifica directamente desde la edición de productos: se administra mediante movimientos y compras.
- El sistema impide registrar salidas que superen las existencias disponibles.
- Las compras pueden anularse, siempre que exista stock suficiente para revertirlas.
- Los eventos de inventario se almacenan en MongoDB después de confirmar la operación en MySQL. Si el registro en MongoDB falla, no se revierte la operación que ya fue confirmada en MySQL.
- Las solicitudes recibidas por NestJS pasan por un ValidationPipe global que transforma los datos, elimina propiedades no permitidas y rechaza propiedades que no estén definidas en los DTOs.
- Los precios se validan como números enteros en los DTOs, de acuerdo con el uso de pesos chilenos en el proyecto.
- La sincronización automática de entidades de TypeORM está desactivada (synchronize: false).
12. Mejoras futuras
- Lectura de códigos QR o códigos de barras mediante cámara.
- Autenticación de usuarios y roles.
- Exportación de informes a PDF y Excel.
- Funcionalidades adicionales de reportes y análisis de inventario.