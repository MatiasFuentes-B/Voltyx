const API_BASE = '/api';

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) msg = body.error;
    } catch (_) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

const api = {
  health: () => apiRequest('/health'),
  dashboard: () => apiRequest('/dashboard'),

  categorias: {
    list: () => apiRequest('/categorias'),
    create: (data) => apiRequest('/categorias', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => apiRequest(`/categorias/${id}`, { method: 'DELETE' }),
  },

  proveedores: {
    list: (q) => apiRequest(`/proveedores${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    create: (data) => apiRequest('/proveedores', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/proveedores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => apiRequest(`/proveedores/${id}`, { method: 'DELETE' }),
  },

  productos: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiRequest(`/productos${qs ? `?${qs}` : ''}`);
    },
    create: (data) => apiRequest('/productos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => apiRequest(`/productos/${id}`, { method: 'DELETE' }),
  },

  movimientos: {
    list: (producto_id) => apiRequest(`/movimientos${producto_id ? `?producto_id=${producto_id}` : ''}`),
    create: (data) => apiRequest('/movimientos', { method: 'POST', body: JSON.stringify(data) }),
  },

  compras: {
    list: () => apiRequest('/compras'),
    get: (id) => apiRequest(`/compras/${id}`),
    create: (data) => apiRequest('/compras', { method: 'POST', body: JSON.stringify(data) }),
    anular: (id) => apiRequest(`/compras/${id}/anular`, { method: 'POST' }),
  },
};
