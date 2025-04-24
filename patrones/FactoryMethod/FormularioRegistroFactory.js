import FormularioFactory from "./FormularioFactory";
import FormularioRegistro from "./FormularioRegistro";
class FormularioRegistroFactory extends FormularioFactory {
    crearFormulario() {
      return new FormularioRegistro();
    }
  }
  
export default FormularioRegistroFactory;
  