# Proyecto EcoTrack

## Descripción

Este proyecto consiste en una aplicación Android desarrollada en React Native. La aplicación está diseñada para ofrecer funcionalidades de mapeo y rutas, integrando diversas APIs y servicios externos. Es un proyecto integral que combina modernas prácticas de desarrollo de software con un enfoque en la usabilidad y la experiencia del usuario.

El proyecto ha sido realizado por los alumnos Daniel Gauchía Alba y Gael Zanón Rives para las asignaturas EI1039 y EI1048 en el curso 2023/2024.

## Configuración Inicial
Para configurar y ejecutar el proyecto correctamente, es necesario establecer algunas configuraciones iniciales relacionadas con las API Keys y la configuración de Firebase.

### Configuración de Google Maps API Key
#### `apikey.properties` en la carpeta Android

Crea un archivo llamado apikey.properties en la carpeta android de tu proyecto.
Añade la siguiente línea, reemplazando apikey con tu Google Maps API Key:

`GOOGLE_MAPS_API_KEY=apikey`
.env en la carpeta raíz del proyecto:

Crea un archivo .env en la carpeta raíz de tu proyecto.
Añade la misma línea que en el archivo apikey.properties:

`GOOGLE_MAPS_API_KEY=apikey`
react-native-config.js en la carpeta de mocks:

Asegúrate de tener un archivo react-native-config.js en tu carpeta de mocks con el siguiente contenido:

```
export default {
  GOOGLE_MAPS_API_KEY: 'apikey',
};
```
Configuración de Firebase
Para integrar Firebase con tu proyecto:

Modifica config.js en la carpeta ./firebase:
Cambia el contenido de config.js para que coincida con la configuración de tu proyecto Firebase. Deberás crear un proyecto en Firebase y obtener las configuraciones necesarias.
El archivo config.js debería tener una estructura similar a la siguiente, llenando los campos vacíos con tu información específica de Firebase:

```
const firebaseConfig = {
  apiKey: "",             // Tu API Key
  authDomain: "",         // Tu Auth Domain
  projectId: "",          // Tu Project ID
  storageBucket: "",      // Tu Storage Bucket
  messagingSenderId: "",  // Tu Messaging Sender ID
  appId: ""               // Tu App ID
};

export default firebaseConfig;
```
## Instalación y Ejecución

Una vez que hayas configurado las claves API y Firebase, puedes proceder con la instalación y ejecución del proyecto:

1. Instala las dependencias del proyecto ejecutando `npm install` o `yarn install` en la terminal, en la carpeta raíz del proyecto.
2. Ejecuta el proyecto con `react-native run-android` para Android.

## Contribución

Si deseas contribuir a este proyecto, por favor considera los siguientes pasos:

1. Realiza un fork del repositorio.
2. Crea una rama para tu característica o corrección.
3. Implementa tus cambios.
4. Envía un pull request para su revisión.

## Licencia

Este proyecto está licenciado bajo los términos MIT.

Con estas instrucciones, deberías ser capaz de configurar y ejecutar el proyecto en tu entorno de desarrollo local. Para cualquier duda o aclaración, no dudes en abrir un issue en el repositorio del proyecto.
