class ContextoFormulario {
    constructor() {
      this.estrategiaValidacion = null;
    }
  
    setEstrategiaValidacion(estrategiaValidacion) {
      this.estrategiaValidacion = estrategiaValidacion;
    }
  
    validarFormulario(datosFormulario) {
      if (!this.estrategiaValidacion) {
        throw new Error("Estrategia de validación no establecida");
      }
      return this.estrategiaValidacion.validar(datosFormulario);
    }
  }
  
  export default ContextoFormulario;
  