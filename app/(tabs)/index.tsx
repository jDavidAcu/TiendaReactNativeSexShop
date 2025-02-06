import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Button,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';

// Definición de la interfaz Producto
interface Producto {
  PRD_ID: number;
  PRD_NOMBRE: string;
  PRD_PRECIO: number;
  PRD_IMAGEN: string;
  PRD_STOCK: number;
  cantidad: number;
}

export default function HomeScreen() {
  const [productos, setProductos] = useState<Producto[]>([]); // Estado para los productos
  const [username, setUsername] = useState(''); // Estado para el usuario logueado
  const router = useRouter(); // Hook para navegación

  // Verificar la sesión al cargar la pantalla
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const usernameGuardado = await AsyncStorage.getItem('username');
        if (!usernameGuardado) {
          Alert.alert('Sesión no iniciada', 'Por favor, inicia sesión para continuar.');
          router.replace('/LoginScreen'); // Redirigir al inicio de sesión
        } else {
          setUsername(usernameGuardado); // Guardar el nombre del usuario logueado
          obtenerProductos(); // Cargar productos si hay sesión activa
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        Alert.alert('Error', 'No se pudo verificar la sesión.');
      }
    };

    verificarSesion();
  }, []); // Ejecutar solo al cargar la pantalla

  // Función para cerrar sesión
  const cerrarSesion = async () => {
    try {
      await AsyncStorage.clear(); // Limpiar AsyncStorage (incluye carrito y username)
      Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
      router.replace('/LoginScreen'); // Redirigir al inicio de sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  // Función para obtener productos desde la API
  const obtenerProductos = async () => {
    try {
      const response = await axios.get('http://sexshop.runasp.net/api/Producto');
      const data = response.data.map((producto: Producto) => ({
        ...producto,
        cantidad: 1, // Inicializamos la cantidad en 1
      }));
      setProductos(data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos.');
    }
  };

  // Función para añadir productos al carrito
  const agregarAlCarrito = async (producto: Producto) => {
    try {
      const carritoString = await AsyncStorage.getItem('carrito');
      const carrito: Producto[] = carritoString ? JSON.parse(carritoString) : [];
      const itemIndex = carrito.findIndex((item) => item.PRD_ID === producto.PRD_ID);

      if (itemIndex >= 0) {
        carrito[itemIndex].cantidad += producto.cantidad;
      } else {
        carrito.push({ ...producto });
      }

      await AsyncStorage.setItem('carrito', JSON.stringify(carrito));
      Alert.alert('Producto agregado', `Se agregó ${producto.PRD_NOMBRE} al carrito.`);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      Alert.alert('Error', 'No se pudo agregar el producto al carrito.');
    }
  };

  // Navegar a la pantalla de compra
  const irAPantallaCompra = () => {
    router.push('/explore');
  };

  return (
    <View style={styles.container}>
      {/* Banner publicitario */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>¡Descubre los mejores productos para tus momentos especiales!</Text>
      </View>

      {/* Nombre del usuario y botón de cerrar sesión */}
      <View style={styles.headerContainer}>
        <Text style={styles.userText}>Estás ingresado como: {username}</Text>
        <TouchableOpacity onPress={cerrarSesion} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>PEPE'S SEX SHOP</Text>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.PRD_ID.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.PRD_IMAGEN }} style={styles.productImage} />
            <Text style={styles.productName}>{item.PRD_NOMBRE}</Text>
            <Text style={styles.productPrice}>Precio: ${item.PRD_PRECIO}</Text>
            <Text style={styles.productStock}>Stock disponible: {item.PRD_STOCK}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() =>
                  setProductos((prevState) =>
                    prevState.map((prod) =>
                      prod.PRD_ID === item.PRD_ID && prod.cantidad > 1
                        ? { ...prod, cantidad: prod.cantidad - 1 }
                        : prod
                    )
                  )
                }
                style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.quantityInput}
                keyboardType="numeric"
                value={item.cantidad.toString()}
                onChangeText={(value) => {
                  const cantidad = Math.max(1, Math.min(item.PRD_STOCK, parseInt(value) || 1));
                  setProductos((prevState) =>
                    prevState.map((prod) =>
                      prod.PRD_ID === item.PRD_ID ? { ...prod, cantidad } : prod
                    )
                  );
                }}
              />
              <TouchableOpacity
                onPress={() =>
                  setProductos((prevState) =>
                    prevState.map((prod) =>
                      prod.PRD_ID === item.PRD_ID && prod.cantidad < item.PRD_STOCK
                        ? { ...prod, cantidad: prod.cantidad + 1 }
                        : prod
                    )
                  )
                }
                style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Button
              title="Añadir al carrito"
              onPress={() => agregarAlCarrito(item)}
              color="#FF004F"
            />
          </View>
        )}
      />

      {/* Botón para ir a la pantalla de compra */}
      <TouchableOpacity style={styles.buyButton} onPress={irAPantallaCompra}>
        <Text style={styles.buyButtonText}>Comprar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  banner: {
    backgroundColor: '#FF004F',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#FF004F',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  productCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  productImage: {
    height: 150,
    width: '100%',
    borderRadius: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF69B4',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 4,
  },
  productStock: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  quantityButton: {
    backgroundColor: '#FF004F',
    padding: 8,
    borderRadius: 8,
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  quantityInput: {
    backgroundColor: '#2a2a2a',
    color: '#FFFFFF',
    textAlign: 'center',
    padding: 8,
    marginHorizontal: 8,
    borderRadius: 8,
    width: 50,
  },
  buyButton: {
    backgroundColor: '#00BFFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
