import ContextoFormulario from '../patrones/Strategy/ContextoFormulario';
import ValidacionLogin from '../patrones/Strategy/ValidacionLogin';
import ValidacionRegistro from '../patrones/Strategy/ValidacionRegistro';

class UserController {
  constructor(authService, cloudService) {
    this.authService = authService;
    this.cloudService = cloudService;
    this.contextoFormulario = new ContextoFormulario();
  }

  async register(formularioRegistro) {
    this.contextoFormulario.setEstrategiaValidacion(new ValidacionRegistro());
    try {
      this.contextoFormulario.validarFormulario(formularioRegistro);

      const result = await this.authService.createUserWithEmailAndPassword(
        formularioRegistro.email,
        formularioRegistro.user,
        formularioRegistro.password1,
      );
      return result;
    } catch (error) {
      // Reenviar la excepción tal como se recibe
      throw error;
    }
  }

  async login(formularioLogin) {
    this.contextoFormulario.setEstrategiaValidacion(new ValidacionLogin());
    try {
      this.contextoFormulario.validarFormulario(formularioLogin);

      const result = await this.authService.signInWithEmailAndPassword(
        formularioLogin.email,
        formularioLogin.password,
      );
      return result;
    } catch (error) {
      // Reenviar la excepción tal como se recibe
      throw error;
    }
  }

  async deleteUser(email) {
    //Consultar base de datos según email  enviado
    const existe = await this.cloudService.userExists(email);
    if (!existe) {
      const error = new Error('UserNotFoundException');
      error.code = 'UserNotFoundException';
      throw error;
    }

    try {
      const resultAuth = await this.authService.deleteUser();
      const resultDatabase = await this.cloudService.deleteUserInfo(email);
      return resultAuth && resultDatabase;
    } catch (error) {
      // Reenviar la excepción tal como se recibe
      throw error;
    }
  }

  async logout(email) {
    //Consultar base de datos según email  enviado
    const existe = await this.cloudService.userExists(email);
    if (!existe) {
      const error = new Error('UserNotFoundException');
      error.code = 'UserNotFoundException';
      throw error;
    }

    try {
      const resultAuth = await this.authService.logout();
      const resultDatabase = await this.cloudService.deleteLocalInfo();
      return resultAuth && resultDatabase;
    } catch (error) {
      // Reenviar la excepción tal como se recibe
      throw error;
    }
  }


  async setDefaultRouteType(email, type) {
    if (type !== 'fast' && type !== 'economic') {
      const error = new Error('InvalidTypeException');
      error.code = 'InvalidTypeException';
      throw error;
    }
    try {
      const resultDatabase = await this.cloudService.setDefaultRouteType(email, type);
      return resultDatabase;
    } catch (error) {
      // Reenviar la excepción tal como se recibe
      throw error;
    }
  }

  async setDefaultVehicle(email, vehicle) {
    
    if (!vehicle) {
      const error = new Error('InvalidVehicleException');
      error.code = 'InvalidVehicleException';
      throw error;
    }
      
    try {
      const resultDatabase = await this.cloudService.setDefaultVehicle(email, vehicle);
      return resultDatabase;
    } catch (error) {
      // Reenviar la excepción tal como se recibe
      throw error;
    }
  }
}

export default UserController;
