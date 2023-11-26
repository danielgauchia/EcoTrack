import User from '../../models/User';
import UserController from '../../controllers/UserController';
import authService from '../../services/authService';
import cloudService from '../../services/cloudService';
import FormularioRegistroFactory from '../../patrones/FactoryMethod/FormularioRegistroFactory';
import FormularioLoginFactory from '../../patrones/FactoryMethod/FormularioLoginFactory';
const AuthService = new authService('test');
const CloudService = new cloudService('test');
const userController = new UserController(AuthService);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(async () => {
  await CloudService.clearCollection('users');
  await jest.clearAllMocks();
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

  it('E3: No se inicia sesión si la contraseña no es válida', async () => {
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
    const usuario = new User('usuario@example.com', 'Password12');
    
    await expect(
      userController.deleteUser(usuario.email),
    ).resolves.toBeTruthy();
  });

  it('E2: Se intenta eliminar un usuario que no existe', async () => {
    await expect(
      userController.deleteUser('usuarioInvalido@example.com'),
    ).rejects.toThrow('InvalidUser');
  });
});
