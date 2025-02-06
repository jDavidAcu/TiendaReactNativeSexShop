import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Ruta de login */}
      <Stack.Screen name="LoginScreen" options={{ title: 'Inicio de Sesión' }} />

      {/* Rutas principales (tabs) */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
