class VehicleController {
  constructor(cloudService) {
    this.cloudService = cloudService;
  }

  validarAnoVehiculo(ano) {
    const anoActual = new Date().getFullYear();
    return ano >= 1990 && ano <= anoActual;
  }

  async registerVehicle(vehicle) {
    // Validación del vehículo antes de intentar registrar
    if (!this.validarAnoVehiculo(vehicle.year)) {
      throw new Error("YearNotValidException");
    }

    try {
      // Usamos cloudService para añadir un vehículo a la colección 'vehicles'
      const docRef = await this.cloudService.addVehicle(vehicle);
      return docRef;
    } catch (error) {
      throw error;
    }
  }

  // Otros métodos del controlador como borrar, actualizar, obtener vehículos, etc.
}

export default VehicleController;
