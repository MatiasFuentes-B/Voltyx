import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StateBannerProps {
  loading?: boolean;
  error?: string | null;
  confirmation?: string | null;
  emptyMessage?: string | null;
  onRetry?: () => void;
}

export function StateBanner({
  loading,
  error,
  confirmation,
  emptyMessage,
  onRetry,
}: StateBannerProps) {
  if (loading) {
    return (
      <View style={styles.box}>
        <ActivityIndicator size="small" color="#f39c12" />
        <Text style={styles.info}>Cargando desde API Voltyx...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.box, styles.errorBox]}>
        <Text style={styles.errorText}>{error}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (confirmation) {
    return (
      <View style={[styles.box, styles.successBox]}>
        <Text style={styles.successText}>{confirmation}</Text>
      </View>
    );
  }

  if (emptyMessage) {
    return (
      <View style={styles.box}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#1e1e1e', padding: 12, borderRadius: 8, marginBottom: 12 },
  info: { color: '#ccc', marginTop: 6, fontSize: 13 },
  errorBox: { backgroundColor: '#2c1414', borderWidth: 1, borderColor: '#e74c3c' },
  errorText: { color: '#ff8a80', fontSize: 13 },
  successBox: { backgroundColor: '#132a1b', borderWidth: 1, borderColor: '#2ecc71' },
  successText: { color: '#69f0ae', fontSize: 13 },
  emptyText: { color: '#aaa', fontSize: 13, textAlign: 'center' },
  retryBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});