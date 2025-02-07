# Tienda Virtual - Sex Shop (React Native)

Este proyecto es una tienda virtual desarrollada con **React Native**, diseñada para ejecutarse en **dispositivos Android**.  
La aplicación obtiene productos desde una base de datos mediante llamadas a la API publicada en:  
[http://sexshop.runasp.net/](http://sexshop.runasp.net/).  

Los usuarios pueden explorar productos, agregarlos al **carrito de compras** y proceder al pago con diferentes métodos de procesamiento.

## Tecnologías Utilizadas

- **React Native**: Framework de JavaScript para el desarrollo de aplicaciones móviles.
- **Expo**: Plataforma para compilar y probar la aplicación en dispositivos Android.
- **APIs REST**: Conexión con servicios web para la gestión de productos, usuarios y compras.

## Características Principales

1. **Acceso con Usuario**: Para ingresar a la tienda, se requiere una cuenta registrada previamente en la base de datos.
2. **Listado de Productos**: Se obtienen desde la base de datos mediante llamadas a la API.
3. **Carrito de Compras**: Los productos pueden añadirse y visualizarse en el carrito antes de finalizar la compra.
4. **Cálculo de Pago**: Se calcula el total a pagar incluyendo el **IVA**.
5. **Métodos de Pago**:  
   - **Compra Instantánea**: Reduce el stock inmediatamente y marca la factura como **Pagada**.  
   - **Pago desde Banca**: Simula una integración con un banco, donde la factura queda en **Pendiente** hasta que se complete el pago. En este caso, el stock no se reduce hasta la confirmación.

## Instalación y Configuración

Para ejecutar el proyecto localmente, recuerda instalar las respectivas dependencias con:

   `npm install`

## Conexión con la API

Este sistema se conecta con las APIs publicadas en [http://sexshop.runasp.net/](http://sexshop.runasp.net/).  
Para más detalles sobre los endpoints disponibles y su funcionamiento, consulta el otro proyecto en mi GitHub: **ApiRestSexShop**.

## Recomendaciones

Este proyecto es una simulación de una tienda virtual con integración de pagos y manejo de stock.
Se recomienda implementar mejoras en seguridad y optimización antes de usarlo en un entorno real.

## Licencia

Este proyecto es de **uso libre** para fines educativos y de demostración.  
No debe utilizarse en producción sin los ajustes y pruebas correspondientes.

## Contacto

Si tienes preguntas o sugerencias, no dudes en contactarme a través de **GitHub** o por correo electrónico en **jose.david.acu@outlook.com**.

---

> *Este proyecto fue desarrollado como parte de un ejercicio de integración de servicios backend con React Native.*
