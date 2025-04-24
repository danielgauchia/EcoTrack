import FormularioFactory from "./FormularioFactory";
import FormularioLogin from "./FormularioLogin";
class FormularioLoginFactory extends FormularioFactory {
    crearFormulario() {
      return new FormularioLogin();
    }
  }
  
  export default FormularioLoginFactory;
  