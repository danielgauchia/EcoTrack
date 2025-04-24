import Validacion from './Validacion';
class ValidacionRegistro extends Validacion {
  validar(datosFormulario) {
    const {email, password1, password2, user} = datosFormulario;

    if (!this.validarEmail(email)) {
      const error = new Error('InvalidEmailException');
      error.code = 'InvalidEmailException';
      throw error;
    }

    if (password1 !== password2) {
      const error = new Error('NotSamePassException');
      error.code = 'NotSamePassException';
      throw error;
    }
    if (!this.validarPassword(password1)) {
      const error = new Error('InvalidPassException');
      error.code = 'InvalidPassException';
      throw error;
    }
    if (!this.validarUsername(user)) {
      const error = new Error('InvalidUsernameException');
      error.code = 'InvalidUsernameException';
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

  validarUsername(username) {
    const longitudValida = username.length >= 4;
    return longitudValida
  }
}

export default ValidacionRegistro;
