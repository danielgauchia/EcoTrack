import Formulario from './Formulario';
class FormularioRegistro extends Formulario {
  constructor() {
    super();
    this.datosFormulario = {
      user: '',
      email: '',
      password1: '',
      password2: '',
    };
  }

  rellenarDatos(datos) {
    this.datosFormulario.user = datos.user || '';
    this.datosFormulario.email = datos.email || '';
    this.datosFormulario.password1 = datos.password1 || '';
    this.datosFormulario.password2 = datos.password2 || '';
  }

  
}
export default FormularioRegistro;
