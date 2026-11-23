import { API_BASE_URL } from '../config/api';

export interface ProductoPayload {
  nombre: string;
  descripcion?: string;
  codigo?: string;
  categoria_id?: number;
  precio_compra?: number;
  precio_venta?: number;
  stock_actual?: number;
  stock_minimo?: number;
}

export interface CompraPayload {
  proveedor_id?: number;
  nota?: string;
  productos: { producto_id: number; cantidad: number; precio_unitario: number }[];
}

export interface ProveedorPayload {
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface MovimientoPayload {
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  producto_id: number;
  motivo?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 204) return null as T;

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const raw =
      typeof data === 'object' && data !== null && 'message' in data
        ? Array.isArray((data as { message: unknown }).message)
          ? ((data as { message: string[] }).message).join(', ')
          : String((data as { message: unknown }).message)
        : `Error HTTP ${response.status}`;
    const friendly = /should not exist|must be|should not be empty/.test(raw)
      ? 'Revisa los datos ingresados e intenta de nuevo.'
      : raw;
    throw new Error(friendly);
  }

  return data as T;
}

export const voltyxApi = {
  getDashboard: () => request<Record<string, unknown>>('/dashboard'),
  getProductos: () => request<any[]>('/productos'),
  getCategorias: () => request<any[]>('/categorias'),
  createProducto: (body: ProductoPayload) =>
    request<any>('/productos', { method: 'POST', body: JSON.stringify(body) }),
  deleteProducto: (id: string | number) =>
    request<any>(`/productos/${id}`, { method: 'DELETE' }),
  getProveedores: () => request<any[]>('/proveedores'),
  createProveedor: (body: ProveedorPayload) =>
    request<any>('/proveedores', { method: 'POST', body: JSON.stringify(body) }),
  getMovimientos: () => request<any[]>('/movimientos'),
  createMovimiento: (body: MovimientoPayload) =>
    request<any>('/movimientos', { method: 'POST', body: JSON.stringify(body) }),
    getCompras: () => request<any[]>('/compras'),
  createCompra: (body: CompraPayload) =>
    request<any>('/compras', { method: 'POST', body: JSON.stringify(body) }),
  anularCompra: (id: number) =>
    request<any>(`/compras/${id}/anular`, { method: 'POST' }),
};