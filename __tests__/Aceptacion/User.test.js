import User from '../../models/User';
import Vehicle from '../../models/Vehicle';
import UserController from '../../controllers/UserController';
import authService from '../../services/authService';
import cloudService from '../../services/cloudService';
import FormularioRegistroFactory from '../../patrones/FactoryMethod/FormularioRegistroFactory';
import FormularioLoginFactory from '../../patrones/FactoryMethod/FormularioLoginFactory';
import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
const AuthService = new authService('test');
const CloudService = new cloudService('test');
const userController = new UserController(AuthService, CloudService);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

afterEach(async () => {
  await CloudService.clearCollection('users');
  await jest.clearAllMocks();
  await AsyncStorage.removeItem('user');
});

describe('HU1: Como usuario no registrado en la aplicación quiero poder registrarme en la misma para poder utilizar sus servicios', () => {
  it('E1: Se crea el usuario correctamente con una contraseña válida', async () => {
    const usuario = new User('usuario@example.com', 'Password12');

    const formularioRegistroFactory = new FormularioRegistroFactory();
    const formularioRegistro = formularioRegistroFactory.crearFormulario();
    formularioRegistro.rellenarDatos({
      user: 'juan',
      email: usuario.email,
      password1: usuario.password,
      password2: usuario.password,
    });
    await expect(
      userController.register(formularioRegistro.datosFormulario),
    ).resolves.toBeTruthy();
    
    //Ahora lo logueamos para borrarlo del auth
    const formularioLoginFactory = new FormularioLoginFactory();
    const formularioLogin = formularioLoginFactory.crearFormulario();
    formularioLogin.rellenarDatos({
      email: usuario.email,
      password: usuario.password,
    });
    await userController.login(formularioLogin.datosFormulario);
    await AuthService.deleteUser();
  });

  it('E2: No se crea el usuario si la contraseña no es válida', async () => {
    const usuario = new User('usuario@example.com', 'Password');
    const formularioRegistroFactory = new FormularioRegistroFactory();
    const formularioRegistro = formularioRegistroFactory.crearFormulario();
    formularioRegistro.rellenarDatos({
      user: 'juan',
      email: usuario.email,
      password1: usuario.password,
      password2: usuario.password,
    });
    await expect(
      userController.register(formularioRegistro.datosFormulario),
    ).rejects.toThrow('InvalidPassException');
  });
});

describe('HU2: Como usuario registrado quiero iniciar sesión en la aplicación para utilizar sus servicios', () => {
  it('E1: Se inicia sesión si credenciales son validas', async () => {
    const usuario = new User('usuario@example.com', 'Password12');
    const formularioLoginFactory = new FormularioLoginFactory();
    const formularioLogin = formularioLoginFactory.crearFormulario();
    formularioLogin.rellenarDatos({
      email: usuario.email,
      password: usuario.password,
    });
    const formularioRegistroFactory = new FormularioRegistroFactory();
    const formularioRegistro = formularioRegistroFactory.crearFormulario();
    formularioRegistro.rellenarDatos({
      user: 'juan',
      email: usuario.email,
      password1: usuario.password,
      password2: usuario.password,
    });
    await userController.register(formularioRegistro.datosFormulario);
    await expect(
      userController.login(formularioLogin.datosFormulario),
    ).resolves.toBeTruthy();
    await AuthService.deleteUser();
  });

  it('E2: No se inicia sesión si la contraseña no es válida', async () => {
    const usuario = new User('usuario@example.com', 'Password');
    const formularioLoginFactory = new FormularioLoginFactory();
    const formularioLogin = formularioLoginFactory.crearFormulario();
    formularioLogin.rellenarDatos({
      email: usuario.email,
      password: usuario.password,
    });
    await expect(
      userController.login(formularioLogin.datosFormulario),
    ).rejects.toThrow('InvalidPassException');
  });
});

describe('HU4: Como usuario quiero poder eliminar mi cuenta', () => {
  it('E1: Se elimina el usuario correctamente', async () => {
    //Para poder borrar el usuario del auth el usuario debe estar loggeado (temas de seguridad de firebase)
    const usuario = new User('usuario@example.com', 'Password12');
    const formularioRegistroFactory = new FormularioRegistroFactory();
    const formularioRegistro = formularioRegistroFactory.crearFormulario();
    formularioRegistro.rellenarDatos({
      user: 'juan',
      email: usuario.email,
      password1: usuario.password,
      password2: usuario.password,
    });
    await userController.register(formularioRegistro.datosFormulario);
    const formularioLoginFactory = new FormularioLoginFactory();
    const formularioLogin = formularioLoginFactory.crearFormulario();
    formularioLogin.rellenarDatos({
      email: usuario.email,
      password: usuario.password,
    });
    await userController.login(formularioLogin.datosFormulario)
    await expect(
      userController.deleteUser(usuario.email),
    ).resolves.toBeTruthy();
  });

  it('E2: Se intenta eliminar un usuario no registrado', async () => {
    await expect(
      userController.deleteUser('usuarioInvalido@example.com'),
    ).rejects.toThrow('UserNotFoundException');
  });
});

describe('HU3: Como usuario quiero poder cerrar la sesión de mi cuenta para salir del sistema.', () => {
  it('E1: Se cierra sesión correctamente al usuario logueado', async () => {
    const usuario = new User('usuario@example.com', 'Password12');
    const formularioRegistroFactory = new FormularioRegistroFactory();
    const formularioRegistro = formularioRegistroFactory.crearFormulario();
    formularioRegistro.rellenarDatos({
      user: 'juan',
      email: usuario.email,
      password1: usuario.password,
      password2: usuario.password,
    });
    await userController.register(formularioRegistro.datosFormulario);
    const formularioLoginFactory = new FormularioLoginFactory();
    const formularioLogin = formularioLoginFactory.crearFormulario();
    formularioLogin.rellenarDatos({
      email: usuario.email,
      password: usuario.password,
    });
    await userController.login(formularioLogin.datosFormulario);
    await expect(userController.logout(usuario.email)).resolves.toBeTruthy();
    //Ahora lo logueamos para borrarlo del auth
    await userController.login(formularioLogin.datosFormulario);
    await AuthService.deleteUser();
  });

  it('E2: Se intenta desloguear un usuario no logueado', async () => {
    const usuario = new User('usuario2@example.com', 'Password12');
    const formularioRegistroFactory = new FormularioRegistroFactory();
    const formularioRegistro = formularioRegistroFactory.crearFormulario();
    formularioRegistro.rellenarDatos({
      user: 'juan',
      email: usuario.email,
      password1: usuario.password,
      password2: usuario.password,
    });
    await userController.register(formularioRegistro.datosFormulario);
    await expect(userController.logout(usuario.email)).rejects.toThrow(
      'UserNotLoggedException',
    );
    
    //Ahora lo logueamos para borrarlo del auth
    const formularioLoginFactory = new FormularioLoginFactory();
    const formularioLogin = formularioLoginFactory.crearFormulario();
    formularioLogin.rellenarDatos({
      email: usuario.email,
      password: usuario.password,
    });
    await userController.login(formularioLogin.datosFormulario);
    await AuthService.deleteUser();
  });

});

describe('HU22: Como usuario quiero establecer un tipo de ruta por defecto a emplear en las nuevas rutas.', () => {
  const creatorEmail = 'usuario@gmail.com';
  const usuario = new User(creatorEmail, 'Password12');

  afterEach(async () => {
    //Ahora lo logueamos para borrarlo del auth
    const formularioLoginFactory = new FormularioLoginFactory();
    const formularioLogin = formularioLoginFactory.crearFormulario();
    formularioLogin.rellenarDatos({
      email: usuario.email,
      password: usuario.password,
    });
    await userController.login(formularioLogin.datosFormulario);
    await AuthService.deleteUser();
  });

  it('E1: Establecer un tipo de ruta por defecto correctamente', async () => {
    const formularioRegistroFactory = new FormularioRegistroFactory();
    const formularioRegistro = formularioRegistroFactory.crearFormulario();
    formularioRegistro.rellenarDatos({
      user: 'juan',
      email: usuario.email,
      password1: usuario.password,
      password2: usuario.password,
    });
    await userController.register(formularioRegistro.datosFormulario);

    await expect(userController.setDefaultRouteType(usuario.email, 'fast')).resolves.toBeTruthy();
    
  });
  it('E2: Intenta establecer un tipo de ruta inexistente por defecto', async () => {
    const formularioRegistroFactory = new FormularioRegistroFactory();
    const formularioRegistro = formularioRegistroFactory.crearFormulario();
    formularioRegistro.rellenarDatos({
      user: 'juan',
      email: usuario.email,
      password1: usuario.password,
      password2: usuario.password,
    });
    await userController.register(formularioRegistro.datosFormulario);
    
    await expect(userController.setDefaultRouteType(usuario.email, 'notFound')).rejects.toThrow(
      'InvalidTypeException',
    );

  });
});

describe('HU21: Como usuario quiero establecer un vehículo/modo de transporte por defecto a emplear en las nuevas rutas que calcule para no tener que indicarlo a mano.', () => {
  const creatorEmail = 'usuario@gmail.com';
  const usuario = new User(creatorEmail, 'Password12');

  afterEach(async () => {
    //Ahora lo logueamos para borrarlo del auth
    const formularioLoginFactory = new FormularioLoginFactory();
    const formularioLogin = formularioLoginFactory.crearFormulario();
    formularioLogin.rellenarDatos({
      email: usuario.email,
      password: usuario.password,
    });
    await userController.login(formularioLogin.datosFormulario);
    await AuthService.deleteUser();
  });
  it('E1: Se establece un vehículo por defecto correctamente', async () => {
    const formularioRegistroFactory = new FormularioRegistroFactory();
    const formularioRegistro = formularioRegistroFactory.crearFormulario();
    formularioRegistro.rellenarDatos({
      user: 'juan',
      email: usuario.email,
      password1: usuario.password,
      password2: usuario.password,
    });
    await userController.register(formularioRegistro.datosFormulario);

    await expect(
      userController.setDefaultVehicle(usuario.email, '1171MSL'),
    ).resolves.toBeTruthy();
  });

  it('E2: Se intenta establecer un vehículo inexistente por defecto', async () => {
    const formularioRegistroFactory = new FormularioRegistroFactory();
    const formularioRegistro = formularioRegistroFactory.crearFormulario();
    formularioRegistro.rellenarDatos({
      user: 'juan',
      email: usuario.email,
      password1: usuario.password,
      password2: usuario.password,
    });
    await userController.register(formularioRegistro.datosFormulario);

    const vehicle = null;

    await expect(userController.setDefaultVehicle(usuario.email, vehicle)).rejects.toThrow(
      'InvalidVehicleException',
    );
  });
});
