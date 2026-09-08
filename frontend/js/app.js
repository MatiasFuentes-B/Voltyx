/* App SPA simple sin framework, construida sobre el grid y los componentes
   de Bootstrap 5 (row/col, card, table, btn, modal). Cada vista es una
   funcion que renderiza HTML dentro de #view-root. */

const viewRoot = document.getElementById('view-root');
const viewTitle = document.getElementById('view-title');
const toastEl = document.getElementById('toast');

// Instancia unica del modal de Bootstrap que reutilizan todos los formularios
const modalEl = document.getElementById('app-modal');
const modalContent = document.getElementById('app-modal-content');
const bsModal = new bootstrap.Modal(modalEl);

// Modal + logica del lector de codigo QR/barras (extension con la camara)
const scannerModalEl = document.getElementById('scanner-modal');
const bsScannerModal = new bootstrap.Modal(scannerModalEl);
let html5QrCode = null;
let scanCallback = null;

function openScanner(onDecoded) {
  scanCallback = onDecoded;
  bsScannerModal.show();
}

scannerModalEl.addEventListener('shown.bs.modal', async () => {
  html5QrCode = new Html5Qrcode('qr-reader');
  try {
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 220 },
      (decodedText) => {
        if (scanCallback) scanCallback(decodedText);
        bsScannerModal.hide();
      },
      () => {} // ignora errores de frames individuales sin codigo detectado
    );
  } catch (err) {
    showToast('No se pudo acceder a la camara: ' + err.message, true);
    bsScannerModal.hide();
  }
});

scannerModalEl.addEventListener('hidden.bs.modal', () => {
  if (html5QrCode) {
    html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
    html5QrCode = null;
  }
  scanCallback = null;
});

// Boton de la topbar: escanea y busca ese codigo directo en Productos
document.getElementById('btn-scan-search').onclick = () => {
  openScanner((codigo) => {
    document.getElementById('global-search').value = codigo;
    productosFilter.q = codigo;
    if (state.view !== 'productos') setView('productos');
    else renderProductos();
    showToast('Código escaneado: ' + codigo);
  });
};

let state = {
  categorias: [],
  proveedores: [],
  view: 'dashboard',
};

function showToast(msg, isError = false) {
  toastEl.textContent = msg;
  toastEl.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => (toastEl.className = 'toast'), 3000);
}

function money(n) {
  return '$' + Math.round(n || 0).toLocaleString('es-CL');
}

function fmtDate(iso) {
  if (!iso) return '—';
  return iso.replace('T', ' ').slice(0, 16);
}

function stockFillClass(actual, minimo) {
  if (actual <= minimo) return 'crit';
  if (actual <= minimo * 1.5) return 'low';
  return 'ok';
}

function stockGauge(actual, minimo) {
  const pct = minimo > 0 ? Math.min(100, Math.round((actual / (minimo * 2 || 1)) * 100)) : 100;
  const cls = stockFillClass(actual, minimo);
  return `<div class="stock-gauge">
    <span class="mono">${actual}</span>
    <div class="bar"><div class="fill ${cls}" style="width:${pct}%"></div></div>
    <span class="dim mono" style="font-size:11px">min ${minimo}</span>
  </div>`;
}

/* ---------------- Navigation ---------------- */
document.getElementById('nav').addEventListener('click', (e) => {
  const btn = e.target.closest('.nav-item');
  if (!btn) return;
  setView(btn.dataset.view);
});

function setView(view) {
  state.view = view;
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  const titles = {
    dashboard: 'Dashboard',
    productos: 'Productos',
    categorias: 'Categorias',
    proveedores: 'Proveedores',
    compras: 'Compras',
    movimientos: 'Movimientos de stock',
  };
  viewTitle.textContent = titles[view] || view;
  document.getElementById('global-search-wrap').classList.toggle('d-none', view !== 'productos');
  render();
}

async function render() {
  viewRoot.innerHTML = '<div class="empty-state">Cargando…</div>';
  try {
    if (state.view === 'dashboard') return renderDashboard();
    if (state.view === 'productos') return renderProductos();
    if (state.view === 'categorias') return renderCategorias();
    if (state.view === 'proveedores') return renderProveedores();
    if (state.view === 'compras') return renderCompras();
    if (state.view === 'movimientos') return renderMovimientos();
  } catch (err) {
    viewRoot.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
  }
}

/* ---------------- Dashboard ---------------- */
async function renderDashboard() {
  const d = await api.dashboard();
  viewRoot.innerHTML = `
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="card stat-card bg-body-tertiary h-100"><div class="card-body">
          <div class="stat-label">Productos activos</div><div class="stat-value">${d.total_productos}</div>
        </div></div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card stat-card alert bg-body-tertiary h-100"><div class="card-body">
          <div class="stat-label">Bajo stock minimo</div><div class="stat-value">${d.productos_bajo_stock}</div>
        </div></div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card stat-card bg-body-tertiary h-100"><div class="card-body">
          <div class="stat-label">Valor de inventario</div><div class="stat-value">${money(d.valor_inventario)}</div>
        </div></div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card stat-card bg-body-tertiary h-100"><div class="card-body">
          <div class="stat-label">Compras este mes</div><div class="stat-value">${money(d.compras_mes_total)}</div>
        </div></div>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-lg-7">
        <div class="card bg-body-tertiary"><div class="card-body">
          <h2 class="card-title-brand border-bottom pb-2 mb-3">Alertas de reposicion</h2>
          ${d.alertas_reposicion.length === 0
            ? '<div class="empty-state">Sin alertas — todo el stock esta sobre el minimo.</div>'
            : `<div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead><tr><th>Producto</th><th>Codigo</th><th>Stock</th></tr></thead><tbody>
                ${d.alertas_reposicion.map(a => `
                  <tr><td>${a.nombre}</td><td class="mono dim">${a.codigo || '—'}</td><td>${stockGauge(a.stock_actual, a.stock_minimo)}</td></tr>
                `).join('')}
               </tbody></table></div>`
          }
        </div></div>
      </div>
      <div class="col-lg-5">
        <div class="card bg-body-tertiary"><div class="card-body">
          <h2 class="card-title-brand border-bottom pb-2 mb-3">Ultimos movimientos</h2>
          ${d.ultimos_movimientos.length === 0
            ? '<div class="empty-state">Sin movimientos registrados aun.</div>'
            : `<div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead><tr><th>Producto</th><th>Tipo</th><th>Cant.</th></tr></thead><tbody>
                ${d.ultimos_movimientos.map(m => `
                  <tr><td>${m.producto_nombre}</td><td><span class="badge ${m.tipo}">${m.tipo}</span></td><td class="mono">${m.cantidad}</td></tr>
                `).join('')}
               </tbody></table></div>`
          }
        </div></div>
      </div>
    </div>
  `;
}

/* ---------------- Categorias ---------------- */
async function loadCategorias() {
  state.categorias = await api.categorias.list();
  return state.categorias;
}

async function renderCategorias() {
  const cats = await loadCategorias();
  viewRoot.innerHTML = `
    <div class="d-flex justify-content-end mb-3">
      <button class="btn btn-primary" id="btn-new-cat">+ Nueva categoria</button>
    </div>
    <div class="card bg-body-tertiary"><div class="card-body">
      ${cats.length === 0 ? '<div class="empty-state">No hay categorias aun.</div>' : `
      <div class="table-responsive"><table class="table table-hover align-middle mb-0">
      <thead><tr><th>Nombre</th><th>Descripcion</th><th></th></tr></thead><tbody>
        ${cats.map(c => `
          <tr>
            <td>${c.nombre}</td>
            <td class="dim">${c.descripcion || '—'}</td>
            <td class="text-end">
              <button class="btn btn-outline-light btn-sm" data-edit="${c.id}">Editar</button>
              <button class="btn btn-outline-danger btn-sm" data-del="${c.id}">Eliminar</button>
            </td>
          </tr>`).join('')}
      </tbody></table></div>`}
    </div></div>
  `;

  document.getElementById('btn-new-cat').onclick = () => openCategoriaModal();
  viewRoot.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
    const cat = cats.find(c => c.id == b.dataset.edit);
    openCategoriaModal(cat);
  });
  viewRoot.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (!confirm('¿Eliminar esta categoria?')) return;
    try { await api.categorias.remove(b.dataset.del); showToast('Categoria eliminada'); renderCategorias(); }
    catch (e) { showToast(e.message, true); }
  });
}

function openCategoriaModal(cat = null) {
  openModal(`
    <div class="modal-header">
      <h3 class="modal-title-brand">${cat ? 'Editar' : 'Nueva'} categoria</h3>
      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <form id="modal-form" class="needs-validation" novalidate>
      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Nombre</label>
          <input type="text" class="form-control" id="f-nombre" value="${cat?.nombre || ''}" required minlength="2" />
          <div class="invalid-feedback">Ingresa un nombre de al menos 2 caracteres.</div>
        </div>
        <div class="mb-3">
          <label class="form-label">Descripcion</label>
          <input type="text" class="form-control" id="f-desc" value="${cat?.descripcion || ''}" />
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
  onModalFormSubmit(async () => {
    const data = { nombre: document.getElementById('f-nombre').value.trim(), descripcion: document.getElementById('f-desc').value.trim() };
    if (cat) await api.categorias.update(cat.id, data);
    else await api.categorias.create(data);
    showToast('Categoria guardada'); renderCategorias();
  });
}

/* ---------------- Proveedores ---------------- */
async function loadProveedores() {
  state.proveedores = await api.proveedores.list();
  return state.proveedores;
}

async function renderProveedores() {
  const provs = await loadProveedores();
  viewRoot.innerHTML = `
    <div class="d-flex justify-content-end mb-3">
      <button class="btn btn-primary" id="btn-new-prov">+ Nuevo proveedor</button>
    </div>
    <div class="card bg-body-tertiary"><div class="card-body">
      ${provs.length === 0 ? '<div class="empty-state">No hay proveedores aun.</div>' : `
      <div class="table-responsive"><table class="table table-hover align-middle mb-0">
      <thead><tr><th>Nombre</th><th>Contacto</th><th>Telefono</th><th>Email</th><th></th></tr></thead><tbody>
        ${provs.map(p => `
          <tr>
            <td>${p.nombre}</td>
            <td class="dim">${p.contacto || '—'}</td>
            <td class="mono">${p.telefono || '—'}</td>
            <td class="dim">${p.email || '—'}</td>
            <td class="text-end">
              <button class="btn btn-outline-light btn-sm" data-edit="${p.id}">Editar</button>
              <button class="btn btn-outline-danger btn-sm" data-del="${p.id}">Eliminar</button>
            </td>
          </tr>`).join('')}
      </tbody></table></div>`}
    </div></div>
  `;

  document.getElementById('btn-new-prov').onclick = () => openProveedorModal();
  viewRoot.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
    const p = provs.find(x => x.id == b.dataset.edit);
    openProveedorModal(p);
  });
  viewRoot.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (!confirm('¿Eliminar este proveedor?')) return;
    try { await api.proveedores.remove(b.dataset.del); showToast('Proveedor eliminado'); renderProveedores(); }
    catch (e) { showToast(e.message, true); }
  });
}

function openProveedorModal(p = null) {
  openModal(`
    <div class="modal-header">
      <h3 class="modal-title-brand">${p ? 'Editar' : 'Nuevo'} proveedor</h3>
      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <form id="modal-form" class="needs-validation" novalidate>
      <div class="modal-body">
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-control" id="f-nombre" value="${p?.nombre || ''}" required minlength="2" />
            <div class="invalid-feedback">Ingresa el nombre del proveedor.</div>
          </div>
          <div class="col-6">
            <label class="form-label">Contacto</label>
            <input type="text" class="form-control" id="f-contacto" value="${p?.contacto || ''}" />
          </div>
          <div class="col-6">
            <label class="form-label">Telefono</label>
            <input type="text" class="form-control" id="f-tel" value="${p?.telefono || ''}" pattern="^[0-9+\\s()-]{6,}$" />
            <div class="invalid-feedback">Solo numeros, espacios y + ( ) -</div>
          </div>
          <div class="col-12">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" id="f-email" value="${p?.email || ''}" />
            <div class="invalid-feedback">Ingresa un email valido.</div>
          </div>
          <div class="col-12">
            <label class="form-label">Direccion</label>
            <input type="text" class="form-control" id="f-dir" value="${p?.direccion || ''}" />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
  onModalFormSubmit(async () => {
    const data = {
      nombre: document.getElementById('f-nombre').value.trim(),
      contacto: document.getElementById('f-contacto').value.trim(),
      telefono: document.getElementById('f-tel').value.trim(),
      email: document.getElementById('f-email').value.trim(),
      direccion: document.getElementById('f-dir').value.trim(),
    };
    if (p) await api.proveedores.update(p.id, data);
    else await api.proveedores.create(data);
    showToast('Proveedor guardado'); renderProveedores();
  });
}

/* ---------------- Productos ---------------- */
let productosFilter = { q: '', categoria_id: '', bajo_stock: '' };

async function renderProductos() {
  await loadCategorias();
  const productos = await api.productos.list(cleanParams(productosFilter));

  viewRoot.innerHTML = `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div class="d-flex flex-wrap gap-2">
        <select class="form-select form-select-sm w-auto" id="f-cat">
          <option value="">Todas las categorias</option>
          ${state.categorias.map(c => `<option value="${c.id}" ${productosFilter.categoria_id == c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
        </select>
        <div class="form-check d-flex align-items-center gap-2 ms-2">
          <input class="form-check-input" type="checkbox" id="f-bajo" ${productosFilter.bajo_stock ? 'checked' : ''} />
          <label class="form-check-label small dim" for="f-bajo">Solo bajo stock</label>
        </div>
      </div>
      <button class="btn btn-primary" id="btn-new-prod">+ Nuevo producto</button>
    </div>
    <div class="card bg-body-tertiary"><div class="card-body">
      ${productos.length === 0 ? '<div class="empty-state">No se encontraron productos.</div>' : `
      <div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead><tr>
        <th>Producto</th><th>Codigo</th><th>Categoria</th><th>Precio venta</th><th>Stock</th><th></th>
      </tr></thead><tbody>
        ${productos.map(p => `
          <tr>
            <td>${p.nombre}</td>
            <td class="mono dim">${p.codigo || '—'}</td>
            <td class="dim">${p.categoria_nombre || '—'}</td>
            <td class="mono">${money(p.precio_venta)}</td>
            <td>${stockGauge(p.stock_actual, p.stock_minimo)}</td>
            <td class="text-end text-nowrap">
              <button class="btn btn-outline-light btn-sm" data-mov="${p.id}">Movimiento</button>
              <button class="btn btn-outline-light btn-sm" data-edit="${p.id}">Editar</button>
              <button class="btn btn-outline-danger btn-sm" data-del="${p.id}">Baja</button>
            </td>
          </tr>`).join('')}
      </tbody></table></div>`}
    </div></div>
  `;

  document.getElementById('f-cat').onchange = (e) => { productosFilter.categoria_id = e.target.value; renderProductos(); };
  document.getElementById('f-bajo').onchange = (e) => { productosFilter.bajo_stock = e.target.checked ? 'true' : ''; renderProductos(); };
  document.getElementById('btn-new-prod').onclick = () => openProductoModal();

  viewRoot.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
    const p = productos.find(x => x.id == b.dataset.edit);
    openProductoModal(p);
  });
  viewRoot.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (!confirm('¿Dar de baja este producto? (se conserva su historial)')) return;
    try { await api.productos.remove(b.dataset.del); showToast('Producto dado de baja'); renderProductos(); }
    catch (e) { showToast(e.message, true); }
  });
  viewRoot.querySelectorAll('[data-mov]').forEach(b => b.onclick = () => {
    const p = productos.find(x => x.id == b.dataset.mov);
    openMovimientoModal(p);
  });
}

function cleanParams(obj) {
  const out = {};
  for (const k in obj) if (obj[k]) out[k] = obj[k];
  return out;
}

// Busqueda rapida global (input en la topbar)
document.getElementById('global-search').addEventListener('input', (e) => {
  productosFilter.q = e.target.value;
  if (state.view === 'productos') renderProductos();
});

function openProductoModal(p = null) {
  openModal(`
    <div class="modal-header">
      <h3 class="modal-title-brand">${p ? 'Editar' : 'Nuevo'} producto</h3>
      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <form id="modal-form" class="needs-validation" novalidate>
      <div class="modal-body">
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-control" id="f-nombre" value="${p?.nombre || ''}" required minlength="2" />
            <div class="invalid-feedback">Ingresa el nombre del producto.</div>
          </div>
          <div class="col-6">
            <label class="form-label">Codigo (SKU / lectura QR)</label>
            <div class="input-group">
              <input type="text" class="form-control" id="f-codigo" value="${p?.codigo || ''}" />
              <button class="btn btn-outline-light" type="button" id="btn-scan-codigo" title="Escanear codigo">📷</button>
            </div>
          </div>
          <div class="col-6">
            <label class="form-label">Categoria</label>
            <select class="form-select" id="f-cat">
              <option value="">Sin categoria</option>
              ${state.categorias.map(c => `<option value="${c.id}" ${p?.categoria_id == c.id ? 'selected' : ''}>${c.nombre}</option>`).join('')}
            </select>
          </div>
          <div class="col-6">
            <label class="form-label">Precio compra</label>
            <input type="number" step="1" min="0" class="form-control" id="f-pc" value="${p?.precio_compra ?? 0}" required />
            <div class="invalid-feedback">Debe ser 0 o mayor.</div>
          </div>
          <div class="col-6">
            <label class="form-label">Precio venta</label>
            <input type="number" step="1" min="0" class="form-control" id="f-pv" value="${p?.precio_venta ?? 0}" required />
            <div class="invalid-feedback">Debe ser 0 o mayor.</div>
          </div>
          ${p ? '' : `<div class="col-6">
            <label class="form-label">Stock inicial</label>
            <input type="number" min="0" class="form-control" id="f-stock" value="0" required />
            <div class="invalid-feedback">Debe ser 0 o mayor.</div>
          </div>`}
          <div class="col-6">
            <label class="form-label">Stock minimo</label>
            <input type="number" min="0" class="form-control" id="f-min" value="${p?.stock_minimo ?? 0}" required />
            <div class="invalid-feedback">Debe ser 0 o mayor.</div>
          </div>
          <div class="col-12">
            <label class="form-label">Descripcion</label>
            <textarea class="form-control" id="f-desc" rows="2">${p?.descripcion || ''}</textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
  document.getElementById('btn-scan-codigo').onclick = () => {
    openScanner((codigo) => {
      document.getElementById('f-codigo').value = codigo;
      showToast('Código escaneado: ' + codigo);
    });
  };
  onModalFormSubmit(async () => {
    const data = {
      nombre: document.getElementById('f-nombre').value.trim(),
      codigo: document.getElementById('f-codigo').value.trim(),
      categoria_id: document.getElementById('f-cat').value || null,
      precio_compra: Number(document.getElementById('f-pc').value) || 0,
      precio_venta: Number(document.getElementById('f-pv').value) || 0,
      stock_minimo: Number(document.getElementById('f-min').value) || 0,
      descripcion: document.getElementById('f-desc').value.trim(),
    };
    if (!p) data.stock_actual = Number(document.getElementById('f-stock').value) || 0;
    if (p) await api.productos.update(p.id, data);
    else await api.productos.create(data);
    showToast('Producto guardado'); renderProductos();
  });
}

function openMovimientoModal(p) {
  openModal(`
    <div class="modal-header">
      <h3 class="modal-title-brand">Movimiento — ${p.nombre}</h3>
      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <form id="modal-form" class="needs-validation" novalidate>
      <div class="modal-body">
        <p class="dim mb-3">Stock actual: <span class="mono">${p.stock_actual}</span></p>
        <div class="row g-3">
          <div class="col-6">
            <label class="form-label">Tipo</label>
            <select class="form-select" id="f-tipo">
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste (suma)</option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label">Cantidad</label>
            <input type="number" class="form-control" id="f-cant" value="1" min="1" required />
            <div class="invalid-feedback">Debe ser mayor a 0.</div>
          </div>
          <div class="col-12">
            <label class="form-label">Motivo</label>
            <input type="text" class="form-control" id="f-motivo" placeholder="ej: Venta mostrador, merma, conteo fisico" />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancelar</button>
        <button type="submit" class="btn btn-primary">Registrar</button>
      </div>
    </form>
  `);
  onModalFormSubmit(async () => {
    const data = {
      producto_id: p.id,
      tipo: document.getElementById('f-tipo').value,
      cantidad: Number(document.getElementById('f-cant').value),
      motivo: document.getElementById('f-motivo').value.trim(),
    };
    await api.movimientos.create(data);
    showToast('Movimiento registrado'); render();
  });
}

/* ---------------- Movimientos (historial) ---------------- */
async function renderMovimientos() {
  const movs = await api.movimientos.list();
  viewRoot.innerHTML = `
    <div class="card bg-body-tertiary"><div class="card-body">
      ${movs.length === 0 ? '<div class="empty-state">Sin movimientos registrados.</div>' : `
      <div class="table-responsive"><table class="table table-hover align-middle mb-0">
      <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Motivo</th></tr></thead><tbody>
        ${movs.map(m => `
          <tr>
            <td class="mono dim">${fmtDate(m.fecha)}</td>
            <td>${m.producto_nombre}</td>
            <td><span class="badge ${m.tipo}">${m.tipo}</span></td>
            <td class="mono">${m.cantidad}</td>
            <td class="dim">${m.motivo || '—'}</td>
          </tr>`).join('')}
      </tbody></table></div>`}
    </div></div>
  `;
}

/* ---------------- Compras ---------------- */
let compraItems = [];

async function renderCompras() {
  await loadProveedores();
  const compras = await api.compras.list();
  viewRoot.innerHTML = `
    <div class="d-flex justify-content-end mb-3">
      <button class="btn btn-primary" id="btn-new-compra">+ Registrar compra</button>
    </div>
    <div class="card bg-body-tertiary"><div class="card-body">
      ${compras.length === 0 ? '<div class="empty-state">No hay compras registradas.</div>' : `
      <div class="table-responsive"><table class="table table-hover align-middle mb-0">
      <thead><tr><th>Fecha</th><th>Proveedor</th><th>Estado</th><th>Total</th><th></th></tr></thead><tbody>
        ${compras.map(c => `
          <tr>
            <td class="mono dim">${fmtDate(c.fecha)}</td>
            <td>${c.proveedor_nombre || 'Sin proveedor'}</td>
            <td><span class="badge ${c.estado}">${c.estado}</span></td>
            <td class="mono">${money(c.total)}</td>
            <td class="text-end">${c.estado !== 'anulada' ? `<button class="btn btn-outline-danger btn-sm" data-anular="${c.id}">Anular</button>` : ''}</td>
          </tr>`).join('')}
      </tbody></table></div>`}
    </div></div>
  `;

  document.getElementById('btn-new-compra').onclick = () => openCompraModal();
  viewRoot.querySelectorAll('[data-anular]').forEach(b => b.onclick = async () => {
    if (!confirm('¿Anular esta compra? Esto revertira el stock que sumo.')) return;
    try { await api.compras.anular(b.dataset.anular); showToast('Compra anulada'); renderCompras(); }
    catch (e) { showToast(e.message, true); }
  });
}

async function openCompraModal() {
  await loadCategorias();
  const productos = await api.productos.list();
  compraItems = [{ producto_id: '', cantidad: 1, precio_unitario: 0 }];

  openModal(`
    <div class="modal-header">
      <h3 class="modal-title-brand">Registrar compra</h3>
      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <form id="modal-form" class="needs-validation" novalidate>
      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Proveedor</label>
          <select class="form-select" id="f-prov">
            <option value="">Sin proveedor</option>
            ${state.proveedores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
          </select>
        </div>
        <div id="compra-items"></div>
        <button class="btn btn-outline-light btn-sm" id="btn-add-item" type="button">+ Agregar producto</button>
        <div class="mb-3 mt-3">
          <label class="form-label">Nota</label>
          <input type="text" class="form-control" id="f-nota" />
        </div>
      </div>
      <div class="modal-footer">
        <div class="mono me-auto" id="compra-total">Total: $0</div>
        <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar compra</button>
      </div>
    </form>
  `);

  function renderItems() {
    const wrap = document.getElementById('compra-items');
    wrap.innerHTML = compraItems.map((it, i) => `
      <div class="row g-2 align-items-end mb-2">
        <div class="col-5">
          <label class="form-label small">Producto</label>
          <select data-idx="${i}" class="form-select form-select-sm it-producto">
            <option value="">Seleccionar…</option>
            ${productos.map(p => `<option value="${p.id}" ${it.producto_id == p.id ? 'selected' : ''}>${p.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="col-3">
          <label class="form-label small">Cantidad</label>
          <input type="number" min="1" class="form-control form-control-sm it-cant" data-idx="${i}" value="${it.cantidad}" />
        </div>
        <div class="col-3">
          <label class="form-label small">Precio unit.</label>
          <input type="number" min="0" class="form-control form-control-sm it-precio" data-idx="${i}" value="${it.precio_unitario}" />
        </div>
        <div class="col-1">
          <button class="btn btn-outline-danger btn-sm" data-remove="${i}" type="button">✕</button>
        </div>
      </div>
    `).join('');

    wrap.querySelectorAll('.it-producto').forEach(el => el.onchange = (e) => {
      compraItems[e.target.dataset.idx].producto_id = e.target.value;
    });
    wrap.querySelectorAll('.it-cant').forEach(el => el.oninput = (e) => {
      compraItems[e.target.dataset.idx].cantidad = Number(e.target.value);
      updateTotal();
    });
    wrap.querySelectorAll('.it-precio').forEach(el => el.oninput = (e) => {
      compraItems[e.target.dataset.idx].precio_unitario = Number(e.target.value);
      updateTotal();
    });
    wrap.querySelectorAll('[data-remove]').forEach(el => el.onclick = () => {
      compraItems.splice(Number(el.dataset.remove), 1);
      if (compraItems.length === 0) compraItems.push({ producto_id: '', cantidad: 1, precio_unitario: 0 });
      renderItems(); updateTotal();
    });
    updateTotal();
  }

  function updateTotal() {
    const total = compraItems.reduce((acc, it) => acc + (it.cantidad || 0) * (it.precio_unitario || 0), 0);
    document.getElementById('compra-total').textContent = `Total: ${money(total)}`;
  }

  renderItems();

  document.getElementById('btn-add-item').onclick = () => {
    compraItems.push({ producto_id: '', cantidad: 1, precio_unitario: 0 });
    renderItems();
  };

  onModalFormSubmit(async () => {
    const items = compraItems.filter(it => it.producto_id && it.cantidad > 0);
    if (items.length === 0) { showToast('Agrega al menos un producto valido', true); throw new Error('sin items'); }
    const data = {
      proveedor_id: document.getElementById('f-prov').value || null,
      nota: document.getElementById('f-nota').value.trim(),
      items,
    };
    await api.compras.create(data);
    showToast('Compra registrada, stock actualizado'); renderCompras();
  });
}

/* ---------------- Modal helper (Bootstrap nativo) ----------------
   Usamos el componente Modal de Bootstrap (bootstrap.Modal) en vez de
   armar un backdrop a mano: eso es justamente "integracion con HTML y
   CSS propio" que pide la pauta, no reemplazar Bootstrap por CSS custom. */
function openModal(innerHtml) {
  modalContent.innerHTML = innerHtml;
  bsModal.show();
}

// Validacion de formularios con la clase Bootstrap "was-validated":
// si el formulario no es valido (segun los atributos required/min/pattern
// de cada input), se marcan los campos en rojo y NO se envia.
function onModalFormSubmit(onValid) {
  const form = document.getElementById('modal-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    try {
      await onValid();
      bsModal.hide();
    } catch (err) {
      if (err.message !== 'sin items') showToast(err.message, true);
    }
  });
}

/* ---------------- Boot ---------------- */
async function boot() {
  try {
    await api.health();
    document.getElementById('api-status').textContent = 'conectada';
    document.getElementById('api-status').className = 'badge status-on';
  } catch (e) {
    document.getElementById('api-status').textContent = 'sin conexion';
  }
  setView('dashboard');
}
boot();
