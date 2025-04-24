import User from '../../models/User';
import authServiceMock from '../../__mocks__/authServiceMock';
import UserController from '../../controllers/UserController';
import FormularioRegistroFactory from '../../patrones/FactoryMethod/FormularioRegistroFactory';
import FormularioLoginFactory from '../../patrones/FactoryMethod/FormularioLoginFactory';
const userController = new UserController(authServiceMock);

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
  it('E1: Se inicia sesión correctamente con credenciales válidas', async () => {

    const usuario = new User('usuario@example.com', 'Password12');
    const formularioLoginFactory = new FormularioLoginFactory();
    const formularioLogin = formularioLoginFactory.crearFormulario();
    formularioLogin.rellenarDatos({
      email: usuario.email,
      password: usuario.password,
    });
    await expect(
      userController.login(formularioLogin.datosFormulario),
    ).resolves.toBeTruthy();

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


