import Validacion from './Validacion';
class ValidacionLogin extends Validacion {
  validar(datosFormulario) {
    const {email, password} = datosFormulario;
    if (!this.validarEmail(email)) {
      const error = new Error('InvalidEmailException');
      error.code = 'InvalidEmailException';
      throw error;
    }
    if (!this.validarPassword(password)) {
      const error = new Error('InvalidPassException');
      error.code = 'InvalidPassException';
      throw error;
    }
    return true;
  }

  validarEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  }

  validarPassword(password) {
    const longitudValida = password.length >= 6;
    const tieneDosNumeros = (password.match(/\d/g) || []).length >= 2;
    return longitudValida && tieneDosNumeros;
  }
}

export default ValidacionLogin;
