import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { voltyxApi } from '../service/voltyxApi';
import { StateBanner } from '../components/StateBanner';

export function NuevoProveedorScreen({ navigation }: any) {
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const submit = async () => {
  setError(null);
  setConfirmation(null);

  if (
    !nombreEmpresa.trim() ||
    !contacto.trim() ||
    !telefono.trim() ||
    !email.trim() ||
    !direccion.trim()
  ) {
    setError('Todos los campos son obligatorios.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    setError('Ingresa un correo electrónico válido.');
    return;
  }

  if (!/^[0-9+\s()-]{8,20}$/.test(telefono.trim())) {
    setError('Ingresa un teléfono válido.');
    return;
  }

  setSaving(true);

  try {
    await voltyxApi.createProveedor({
      nombre: nombreEmpresa.trim(),
      contacto: contacto.trim(),
      telefono: telefono.trim(),
      email: email.trim().toLowerCase(),
      direccion: direccion.trim(),
    });

    setConfirmation('Proveedor guardado correctamente.');
    setTimeout(() => navigation.goBack(), 700);

  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Error al guardar proveedor'
    );
  } finally {
    setSaving(false);
  }
};

  return (
    <ScrollView style={styles.container}>
      <StateBanner loading={saving} error={error} confirmation={confirmation} />

      <Text style={styles.label}>Nombre Empresa *</Text>
      <TextInput
        style={styles.input}
        value={nombreEmpresa}
        onChangeText={setNombreEmpresa}
        placeholder="Ej: Insumos Pacífico"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Contacto*</Text>
      <TextInput
        style={styles.input}
        value={contacto}
        onChangeText={setContacto}
        placeholder="Ej: Ana Rojas"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Teléfono*</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
        placeholder="+56911112222"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Email*</Text>
      <TextInput
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        placeholder="ventas@empresa.cl"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Dirección*</Text>
      <TextInput
        style={styles.input}
        value={direccion}
        onChangeText={setDireccion}
        placeholder="Dirección"
        placeholderTextColor="#666"
      />

      <TouchableOpacity style={[styles.btn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
        <Text style={styles.btnText}>{saving ? 'Guardando...' : 'GUARDAR PROVEEDOR'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  label: { color: '#ccc', marginBottom: 6, fontSize: 13 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 14 },
  btn: { backgroundColor: '#f39c12', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 24 },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
});