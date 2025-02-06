import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function LoginScreen() {
  const [dni, setDni] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Manejar inicio de sesión
  const handleLogin = async () => {
    if (!dni || !username || !password) {
      Alert.alert('Error', 'Por favor llena todos los campos.');
      return;
    }

    try {
      const response = await axios.get(`http://sexshop.runasp.net/api/Usuario?DNI=${dni}`);
      const usuario = response.data;

      if (usuario && usuario.USU_NOMBRE === username && usuario.USU_CONTRASENA === password) {
        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('dni', dni);
        Alert.alert('Inicio de sesión exitoso', '¡Bienvenido a Pepe\'s Sex Shop!');
        router.replace('/'); // Redirigir a la pantalla principal (productos)
      } else {
        Alert.alert('Error', 'Usuario o contraseña incorrectos.');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert('Error', 'No se pudo iniciar sesión. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Inicio de Sesión</Text>
      <TextInput
        placeholder="DNI"
        style={styles.input}
        value={dni}
        onChangeText={setDni}
        keyboardType="numeric"
        placeholderTextColor="#CCCCCC"
      />
      <TextInput
        placeholder="Usuario"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="#CCCCCC"
      />
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#CCCCCC"
      />
      <Button title="Iniciar Sesión" onPress={handleLogin} color="#FF004F" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#FFFFFF',
    padding: 8,
    marginBottom: 16,
    borderRadius: 8,
    width: '80%',
  },
});
