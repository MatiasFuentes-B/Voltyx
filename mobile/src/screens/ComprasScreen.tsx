import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { voltyxApi } from '../service/voltyxApi';
import { StateBanner } from '../components/StateBanner';

export function ComprasScreen() {
  const [compras, setCompras] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [proveedorId, setProveedorId] = useState<number | undefined>();
  const [productoId, setProductoId] = useState<number | undefined>();
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [nota, setNota] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, p, pr] = await Promise.all([
        voltyxApi.getCompras(),
        voltyxApi.getProductos(),
        voltyxApi.getProveedores(),
      ]);
      setCompras(c);
      setProductos(p);
      setProveedores(pr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const elegirProducto = (p: any) => {
    setProductoId(p.id);
    if (p.precio_compra !== undefined && p.precio_compra !== null) {
      setPrecio(String(p.precio_compra));
    }
  };

  const submit = async () => {
    setError(null);
    setConfirmation(null);
    if (!productoId) return setError('Selecciona un producto.');
    const cant = Number(cantidad);
    if (!Number.isInteger(cant) || cant <= 0) return setError('La cantidad debe ser un entero mayor a 0.');
    const prec = Number(precio);
    if (!Number.isFinite(prec) || prec < 0) return setError('El precio unitario no es válido.');

    setSaving(true);
    try {
      await voltyxApi.createCompra({
        proveedor_id: proveedorId,
        nota: nota.trim() || undefined,
        productos: [{ producto_id: productoId, cantidad: cant, precio_unitario: prec }],
      });
      setConfirmation('Compra registrada. El stock y el dashboard se actualizaron.');
      setCantidad('');
      setNota('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const anular = async (id: number) => {
    setError(null);
    setConfirmation(null);
    try {
      await voltyxApi.anularCompra(id);
      setConfirmation(`Compra #${id} anulada.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al anular');
    }
  };

  const chip = (activo: boolean) => ({
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: activo ? '#f39c12' : '#262626',
  });

  return (
    <ScrollView
      style={s.container}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Text style={s.title}>Compras</Text>
      <StateBanner loading={loading} error={error} onRetry={load} />
      {confirmation && <Text style={s.ok}>{confirmation}</Text>}

      <View style={s.form}>
        <Text style={s.label}>Proveedor (opcional, toca de nuevo para quitar)</Text>
        <View style={s.row}>
          {proveedores.map((pv) => (
            <TouchableOpacity
              key={pv.id}
              onPress={() => setProveedorId(proveedorId === pv.id ? undefined : pv.id)}
              style={chip(proveedorId === pv.id)}
            >
              <Text style={{ color: proveedorId === pv.id ? '#000' : '#fff' }}>{pv.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Producto</Text>
        <View style={s.row}>
          {productos.map((p) => (
            <TouchableOpacity key={p.id} onPress={() => elegirProducto(p)} style={chip(productoId === p.id)}>
              <Text style={{ color: productoId === p.id ? '#000' : '#fff' }}>{p.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Cantidad</Text>
        <TextInput style={s.input} value={cantidad} onChangeText={setCantidad} keyboardType="numeric" placeholder="Ej: 10" placeholderTextColor="#666" />

        <Text style={s.label}>Precio unitario</Text>
        <TextInput style={s.input} value={precio} onChangeText={setPrecio} keyboardType="numeric" placeholder="Ej: 120" placeholderTextColor="#666" />

        <Text style={s.label}>Nota (opcional)</Text>
        <TextInput style={s.input} value={nota} onChangeText={setNota} placeholder="Ej: Pedido de noviembre" placeholderTextColor="#666" />

        <TouchableOpacity style={[s.button, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
          <Text style={s.buttonText}>{saving ? 'Guardando...' : 'Registrar compra'}</Text>
        </TouchableOpacity>
      </View>

      {compras.map((c) => (
        <View key={c.id} style={s.item}>
          <View style={{ flex: 1 }}>
            <Text style={s.itemTitle}>Compra #{c.id} · ${Number(c.total).toLocaleString('es-CL')}</Text>
            <Text style={s.itemSub}>
              {c.proveedor?.nombre ?? 'Sin proveedor'} · {c.estado}
            </Text>
          </View>
          {c.estado !== 'anulada' && (
            <TouchableOpacity onPress={() => anular(c.id)}>
              <Text style={s.anular}>Anular</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  ok: { color: '#2ecc71', marginBottom: 12 },
  form: { backgroundColor: '#1e1e1e', borderRadius: 12, padding: 14, marginBottom: 16 },
  label: { color: '#bbb', marginBottom: 6, marginTop: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  input: { backgroundColor: '#262626', color: '#fff', borderRadius: 10, padding: 12 },
  button: { backgroundColor: '#e5a03a', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  buttonText: { fontWeight: 'bold', color: '#000' },
  item: { backgroundColor: '#1e1e1e', borderRadius: 10, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  itemTitle: { color: '#fff', fontWeight: 'bold' },
  itemSub: { color: '#aaa', marginTop: 2 },
  anular: { color: '#ef4444', fontWeight: 'bold' },
});