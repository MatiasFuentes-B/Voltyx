import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { voltyxApi } from '../service/voltyxApi';
import { StateBanner } from '../components/StateBanner';

export function NuevoProductoScreen({ navigation }: any) {
  const [nombre, setNombre] = useState('');
  const [sku, setSku] = useState('');
  const [precioCompra, setPrecioCompra] = useState('0');
  const [precioVenta, setPrecioVenta] = useState('0');
  const [stockInicial, setStockInicial] = useState('0');
  const [stockMinimo, setStockMinimo] = useState('1');
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

useEffect(() => {
  voltyxApi.getCategorias().then(setCategorias).catch(() => setCategorias([]));
}, []);

   const submit = async () => {
    setError(null);
    setConfirmation(null);

    if (!nombre.trim()) return setError('El nombre del producto es obligatorio.');
    if (!sku.trim()) return setError('El código es obligatorio.');
    if (!categoriaId) return setError('Selecciona una categoría.');

    const compra = Number(precioCompra);
    const venta = Number(precioVenta);
    const stock = Number(stockInicial);
    const minimo = Number(stockMinimo);

    if (!Number.isInteger(compra) || compra <= 0)
      return setError('El precio de compra debe ser un entero mayor a 0.');
    if (!Number.isInteger(venta) || venta <= 0)
      return setError('El precio de venta debe ser un entero mayor a 0.');
    if (!Number.isInteger(stock) || stock < 0)
      return setError('El stock inicial debe ser un entero igual o mayor a 0.');
    if (!Number.isInteger(minimo) || minimo < 0)
      return setError('El stock mínimo debe ser un entero igual o mayor a 0.');
    if (!Number.isInteger(stock) || stock < 0)
       return setError('El stock inicial debe ser un entero igual o mayor a 0.');
    if (!Number.isInteger(stock) || stock <= 0)
      return setError('El stock inicial debe ser un entero mayor a 0.');
    if (!stockMinimo.trim())
      return setError('El stock mínimo es obligatorio.');
    if (!Number.isInteger(minimo) || minimo <= 0)
      return setError('El stock mínimo debe ser un entero mayor a 0.');
    setSaving(true);
    try {
      await voltyxApi.createProducto({
        nombre: nombre.trim(),
        categoria_id: categoriaId,
        descripcion: descripcion.trim() || undefined,
        codigo: sku.trim(),
        precio_compra: compra,
        precio_venta: venta,
        stock_actual: stock,
        stock_minimo: minimo,
      });
      setConfirmation('Producto guardado en el sistema.');
      setTimeout(() => navigation.goBack(), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StateBanner loading={saving} error={error} confirmation={confirmation} />

      <Text style={styles.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej: Taladro Percutor"
        placeholderTextColor="#666"
      />
      
      <Text style={styles.label}>Categoría</Text>
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
  {categorias.map((c) => {
    const activa = categoriaId === c.id;
    return (
      <TouchableOpacity
        key={c.id}
        onPress={() => setCategoriaId(activa ? undefined : c.id)}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: activa ? '#f39c12' : '#1e1e1e',
        }}
      >
        <Text style={{ color: activa ? '#000' : '#fff' }}>{c.nombre}</Text>
      </TouchableOpacity>
    );
  })}
</View>

      <Text style={styles.label}>SKU</Text>
      <TextInput
        style={styles.input}
        value={sku}
        onChangeText={setSku}
        placeholder="Ej: FER-TAL-01"
        placeholderTextColor="#666"
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Precio Compra *</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={precioCompra}
            onChangeText={setPrecioCompra}
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Precio Venta *</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={precioVenta}
            onChangeText={setPrecioVenta}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Stock Inicial *</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={stockInicial}
            onChangeText={setStockInicial}
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Stock Mínimo *</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={stockMinimo}
            onChangeText={setStockMinimo}
          />
        </View>
      </View>

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 70 }]}
        multiline
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TouchableOpacity style={[styles.btn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
        <Text style={styles.btnText}>{saving ? 'Guardando...' : 'GUARDAR PRODUCTO'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  label: { color: '#ccc', marginBottom: 6, fontSize: 13 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { width: '48%' },
  btn: { backgroundColor: '#f39c12', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 24 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
});