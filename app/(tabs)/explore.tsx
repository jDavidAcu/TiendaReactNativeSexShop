import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useRouter } from 'expo-router';
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

export default function ExploreScreen() {
  const [carrito, setCarrito] = useState<Producto[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIva] = useState(0);
  const [total, setTotal] = useState(0);
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [username, setUsername] = useState('');
  const [dni, setDni] = useState('');

  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        const carritoString = await AsyncStorage.getItem('carrito');
        const usernameGuardado = await AsyncStorage.getItem('username');
        const dniGuardado = await AsyncStorage.getItem('dni');
        const carritoParseado = carritoString ? JSON.parse(carritoString) : [];
        setCarrito(carritoParseado);
        setUsername(usernameGuardado || '');
        setDni(dniGuardado || '');

        // Calcula los totales una vez que el carrito está cargado
        if (carritoParseado.length > 0) {
          calcularTotales(carritoParseado);
        }
      } catch (error) {
        console.error('Error inicializando datos:', error);
      }
    };

    inicializarDatos();
  }, []);

  const calcularTotales = async (carritoLocal: Producto[]) => {
    try {
      const response = await axios.get('http://sexshop.runasp.net/api/DatosGenerales/1');
      const datosGenerales = response.data;
      const ivaPorcentaje = datosGenerales.IVA;

      const subtotalCalc = carritoLocal.reduce(
        (sum, item) => sum + item.PRD_PRECIO * item.cantidad,
        0
      );
      const ivaCalc = subtotalCalc * (ivaPorcentaje / 100);
      const totalCalc = subtotalCalc + ivaCalc;

      setSubtotal(subtotalCalc);
      setIva(ivaPorcentaje);
      setTotal(totalCalc);
    } catch (error) {
      console.error('Error al calcular totales:', error);
      Alert.alert('Error', 'No se pudieron calcular los totales.');
    }
  };

  // Función para aumentar la cantidad de un producto
  const aumentarCantidad = async (productoId: number) => {
    const carritoActualizado = carrito.map((item) =>
      item.PRD_ID === productoId && item.cantidad < item.PRD_STOCK
        ? { ...item, cantidad: item.cantidad + 1 }
        : item
    );
    setCarrito(carritoActualizado);
    await AsyncStorage.setItem('carrito', JSON.stringify(carritoActualizado));
    calcularTotales(carritoActualizado);
  };

  // Función para disminuir la cantidad de un producto
  const disminuirCantidad = async (productoId: number) => {
    const carritoActualizado = carrito.map((item) =>
      item.PRD_ID === productoId && item.cantidad > 1
        ? { ...item, cantidad: item.cantidad - 1 }
        : item
    );
    setCarrito(carritoActualizado);
    await AsyncStorage.setItem('carrito', JSON.stringify(carritoActualizado));
    calcularTotales(carritoActualizado);
  };

  // Función para eliminar un producto del carrito
  const eliminarProducto = async (productoId: number) => {
    const carritoActualizado = carrito.filter((item) => item.PRD_ID !== productoId);
    setCarrito(carritoActualizado);
    await AsyncStorage.setItem('carrito', JSON.stringify(carritoActualizado));
    calcularTotales(carritoActualizado);
  };

  const guardarFactura = async (estado: 'Pagado' | 'Pendiente') => {
    try {
      const response = await axios.get('http://sexshop.runasp.net/api/DatosGenerales/1');
      const datosGenerales = response.data;
      const numeroFactura = `FAC${datosGenerales.NUM_FAC}`;
      const fechaFactura = new Date().toISOString();

      const factura = {
        FAC_NUMERO: numeroFactura,
        USU_DNI: dni,
        USU_NOMBRE: username,
        USU_CORREO: correo,
        FAC_DIRECCION: direccion,
        FAC_TELEFONO: telefono,
        FAC_FECHA: fechaFactura,
        FAC_TOTAL: total,
        FAC_ESTADO: estado,
      };

      await axios.post('http://sexshop.runasp.net/api/Factura', factura);
      await guardarDetalleFactura(numeroFactura);

      if (estado === 'Pagado') {
        await debitarStock();
      }

      await axios.put('http://sexshop.runasp.net/api/DatosGenerales/1', {
        ...datosGenerales,
        NUM_FAC: datosGenerales.NUM_FAC + 1,
      });

      Alert.alert('Éxito', `Factura ${numeroFactura} ingresada correctamente.`);
      await AsyncStorage.removeItem('carrito');
      setCarrito([]);
    } catch (error) {
      console.error('Error al guardar la factura:', error);
      Alert.alert('Error', 'Hubo un problema al procesar la factura.');
    }
  };

  const guardarDetalleFactura = async (numeroFactura: string) => {
    try {
      for (const item of carrito) {
        const detalle = {
          FAC_NUMERO: numeroFactura,
          PRD_ID: item.PRD_ID,
          PRD_CANTIDAD: item.cantidad,
          PRD_SUBTOTAL: item.PRD_PRECIO * item.cantidad,
        };
        await axios.post('http://sexshop.runasp.net/api/Detalle_Factura', detalle);
      }
      router.push('/');
    } catch (error) {
      console.error('Error al guardar detalle de factura:', error);
    }
  };

  const debitarStock = async () => {
    const errores: string[] = [];
  
    for (const item of carrito) {
      try {
        // Obtén el producto del servidor para verificar su stock
        const response = await axios.get(`http://sexshop.runasp.net/api/Producto?PrdNombre=${item.PRD_ID}`);
        const producto = response.data;
  
        // Verifica si hay suficiente stock
        if (producto.PRD_STOCK < item.cantidad) {
          errores.push(`Stock insuficiente para ${producto.PRD_NOMBRE}.`);
          continue; // Salta al siguiente producto
        }
  
        // Reduce el stock y actualiza en el servidor
        const nuevoStock = producto.PRD_STOCK - item.cantidad;
        await axios.put(`http://sexshop.runasp.net/api/Producto/${item.PRD_ID}`, {
          ...producto,
          PRD_STOCK: nuevoStock, // Envía el stock actualizado
        });
  
        console.log(`Stock actualizado para ${producto.PRD_NOMBRE}: ${nuevoStock}`);
      } catch (error) {
        console.error(`Error al debitar stock para el producto ${item.PRD_NOMBRE}:`, error);
        errores.push(`Error al actualizar stock para ${item.PRD_NOMBRE}.`);
      }
    }
  
    // Manejar errores si los hay
    if (errores.length > 0) {
      Alert.alert('Errores al debitar stock', errores.join('\n'));
    } else {
      Alert.alert('Éxito', 'Stock actualizado correctamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Carrito de Compras</Text>
      <FlatList
        data={carrito}
        keyExtractor={(item) => item.PRD_ID.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Text style={styles.productName}>{item.PRD_NOMBRE}</Text>
            <Text style={styles.productPrice}>Precio: ${item.PRD_PRECIO}</Text>
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => disminuirCantidad(item.PRD_ID)}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.productQuantity}>{item.cantidad}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => aumentarCantidad(item.PRD_ID)}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => eliminarProducto(item.PRD_ID)}
              >
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.totals}>
        <Text style={styles.totalsText}>Subtotal: ${subtotal.toFixed(2)}</Text>
        <Text style={styles.totalsText}>IVA ({iva}%): ${(subtotal * (iva / 100)).toFixed(2)}</Text>
        <Text style={styles.totalsText}>Total: ${total.toFixed(2)}</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Correo"
        placeholderTextColor="#CCC"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        placeholderTextColor="#CCC"
        value={direccion}
        onChangeText={setDireccion}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        placeholderTextColor="#CCC"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />
      <TouchableOpacity style={styles.payButton} onPress={() => guardarFactura('Pagado')}>
        <Text style={styles.payButtonText}>Pagar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.payWebButton}
        onPress={() => guardarFactura('Pendiente')}
      >
        <Text style={styles.payWebButtonText}>Pagar desde la Web</Text>
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  productName: {
    fontSize: 18,
    color: '#FF69B4',
  },
  productPrice: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#FF004F',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  productQuantity: {
    fontSize: 16,
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  totals: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  totalsText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#FFFFFF',
    padding: 8,
    marginVertical: 8,
    borderRadius: 8,
  },
  payButton: {
    backgroundColor: '#FF004F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  payWebButton: {
    backgroundColor: '#00BFFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  payWebButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
