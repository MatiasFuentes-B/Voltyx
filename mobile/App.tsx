import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { ProductosScreen } from './src/screens/ProductosScreen';
import { NuevoProductoScreen } from './src/screens/NuevoProductoScreen';
import { ProveedoresScreen } from './src/screens/ProveedoresScreen';
import { NuevoProveedorScreen } from './src/screens/NuevoProveedorScreen';
import { MovimientosScreen } from './src/screens/MovimientosScreen';

const Tab = createBottomTabNavigator();
const ProductosStack = createNativeStackNavigator();
const ProveedoresStack = createNativeStackNavigator();

function ProductosStackNav() {
  return (
    <ProductosStack.Navigator
      screenOptions={{ headerStyle: { backgroundColor: '#1e1e1e' }, headerTintColor: '#fff' }}
    >
      <ProductosStack.Screen
        name="ListaProductos"
        component={ProductosScreen}
        options={{ title: 'Productos' }}
      />
      <ProductosStack.Screen
        name="NuevoProducto"
        component={NuevoProductoScreen}
        options={{ title: 'Nuevo Producto' }}
      />
    </ProductosStack.Navigator>
  );
}

function ProveedoresStackNav() {
  return (
    <ProveedoresStack.Navigator
      screenOptions={{ headerStyle: { backgroundColor: '#1e1e1e' }, headerTintColor: '#fff' }}
    >
      <ProveedoresStack.Screen
        name="ListaProveedores"
        component={ProveedoresScreen}
        options={{ title: 'Proveedores' }}
      />
      <ProveedoresStack.Screen
        name="NuevoProveedor"
        component={NuevoProveedorScreen}
        options={{ title: 'Nuevo Proveedor' }}
      />
    </ProveedoresStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: '#1e1e1e', borderTopColor: '#333' },
            tabBarActiveTintColor: '#f39c12',
            tabBarInactiveTintColor: '#888',
          }}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Productos" component={ProductosStackNav} />
          <Tab.Screen name="Proveedores" component={ProveedoresStackNav} />
          <Tab.Screen name="Movimientos" component={MovimientosScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}