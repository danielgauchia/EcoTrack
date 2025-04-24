class Formulario {
  constructor() {
    if (this.constructor === Formulario) {
      throw new Error("No se puede instanciar la clase abstracta 'Formulario'");
    }
    this.datosFormulario = {};
  }

  rellenarDatos() {
    throw new Error("Método 'rellenarDatos' debe ser implementado");
  }

}
export default Formulario;
