import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { voltyxApi } from '../service/voltyxApi';
import { StateBanner } from '../components/StateBanner';

type Tipo = 'entrada' | 'salida' | 'ajuste';

export function MovimientosScreen() {
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [tipo, setTipo] = useState<Tipo>('entrada');
  const [productoId, setProductoId] = useState<number | undefined>();
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, p] = await Promise.all([voltyxApi.getMovimientos(), voltyxApi.getProductos()]);
      setMovimientos(m);
      setProductos(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    setError(null);
    setConfirmation(null);
    if (!productoId) return setError('Selecciona un producto.');
    const cant = Number(cantidad);
    if (!Number.isInteger(cant) || cant <= 0) return setError('La cantidad debe ser un entero mayor a 0.');

    setSaving(true);
    try {
      await voltyxApi.createMovimiento({
        tipo,
        cantidad: cant,
        producto_id: productoId,
        motivo: motivo.trim() || undefined,
      });
      setConfirmation('Movimiento registrado.');
      setCantidad('');
      setMotivo('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const chip = (activo: boolean) => ({
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: activo ? '#f39c12' : '#1e1e1e',
  });

  return (
    <ScrollView
      style={s.container}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Text style={s.title}>Movimientos</Text>
      <StateBanner loading={loading} error={error} onRetry={load} emptyMessage={undefined} />
      {confirmation && <Text style={s.ok}>{confirmation}</Text>}

      <View style={s.form}>
        <Text style={s.label}>Tipo</Text>
        <View style={s.row}>
          {(['entrada', 'salida', 'ajuste'] as Tipo[]).map((t) => (
            <TouchableOpacity key={t} onPress={() => setTipo(t)} style={chip(tipo === t)}>
              <Text style={{ color: tipo === t ? '#000' : '#fff' }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Producto</Text>
        <View style={s.row}>
          {productos.map((p) => (
            <TouchableOpacity key={p.id} onPress={() => setProductoId(p.id)} style={chip(productoId === p.id)}>
              <Text style={{ color: productoId === p.id ? '#000' : '#fff' }}>{p.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Cantidad</Text>
        <TextInput style={s.input} value={cantidad} onChangeText={setCantidad} keyboardType="numeric" placeholder="Ej: 5" placeholderTextColor="#666" />

        <Text style={s.label}>Motivo (opcional)</Text>
        <TextInput style={s.input} value={motivo} onChangeText={setMotivo} placeholder="Ej: Venta, compra, descarte" placeholderTextColor="#666" />

        <TouchableOpacity style={[s.button, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
          <Text style={s.buttonText}>{saving ? 'Guardando...' : 'Registrar movimiento'}</Text>
        </TouchableOpacity>
      </View>

      {movimientos.map((m) => (
        <View key={m.id} style={s.item}>
          <Text style={s.itemTitle}>{m.tipo} · Cant: {m.cantidad}</Text>
          {!!m.motivo && <Text style={s.itemSub}>{m.motivo}</Text>}
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
  item: { backgroundColor: '#1e1e1e', borderRadius: 10, padding: 14, marginBottom: 8 },
  itemTitle: { color: '#fff', fontWeight: 'bold' },
  itemSub: { color: '#aaa', marginTop: 2 },
});