import Formulario from './Formulario';
class FormularioLogin extends Formulario {
  constructor() {
    super();
    this.datosFormulario = {
      email: '',
      password: '',
    };
  }

  rellenarDatos(datos) {
    this.datosFormulario.email = datos.email || '';
    this.datosFormulario.password = datos.password || '';
  }


}
export default FormularioLogin;
