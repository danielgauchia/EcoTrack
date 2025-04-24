export default class RouteController {
  constructor(
    cloudService,
    routeService,
    carburanteService,
    precioElectricidadService,
  ) {
    this.cloudService = cloudService;
    this.rutaService = routeService;
    this.carburanteService = carburanteService;
    this.precioElectricidadService = precioElectricidadService;
  }

  async getRoute(route) {
    if (route.origin.name === '' || route.destiny.name === '') {
      const error = new Error('InvalidInterestPointException');
      error.code = 'InvalidInterestPointException';
      throw error;
    }

    try {
      const journey = await this.rutaService.obtenerRuta(
        route.origin,
        route.destiny,
        route.mode,
        route.vehicle,
      );

      return journey;
    } catch (error) {
      throw error;
    }
  }

  async getPrice(journey, route) {
    let price = 0;
    switch (route.vehicle.type) {
      case 'electric':
        price =
          await this.precioElectricidadService.obtenerPrecioElectricidad();
        price = (
          (journey.distance / 1000 / 100) *
          (route.vehicle.averageConsumption > 0
            ? route.vehicle.averageConsumption
            : 16) *
          (price / 1000)
        ).toFixed(2);
        price = parseFloat(price);
        return price;

      case 'gasoline':
        price = await this.carburanteService.obtenerPrecioCarburante(
          'gasoline',
          journey.coordinates[0],
        );
        price = (
          (journey.distance / 1000 / 100) *
          (route.vehicle.averageConsumption > 0
            ? route.vehicle.averageConsumption
            : 6) *
          price
        ).toFixed(2);
        price = parseFloat(price);
        return price;

      case 'diesel':
        price = await this.carburanteService.obtenerPrecioCarburante(
          'diesel',
          journey.coordinates[0],
        );
        price = (
          (journey.distance / 1000 / 100) *
          (route.vehicle.averageConsumption > 0
            ? route.vehicle.averageConsumption
            : 6) *
          price
        ).toFixed(2);
        price = parseFloat(price);
        return price;

      case 'bike':
        // Se parte de una média de 6.4 calorías por minuto en bici
        calories = (journey.duration / 60) * 6.4;
        return Math.ceil(calories);
      case 'walking':
        // Se parte de una média de 4 calorías por minuto andado
        calories = (journey.duration / 60) * 4;
        return Math.ceil(calories);

      default:
        // Manejar cualquier otro tipo de vehículo no especificado
        const error = new Error('InvalidVehicleException');
        error.code = 'InvalidVehicleException';
        throw error;
    }
  }

  async storeJourney(journey) {
    // Validación antes de intentar registrar
    if (journey.name.length < 4) {
      const error = new Error('InvalidNameException');
      error.code = 'InvalidNameException';
      throw error;
    }

    try {
      // Usamos cloudService para añadir una journey a la colección 'journeys'
      const docRef = await this.cloudService.addJourney(journey);
      return docRef;
    } catch (error) {
      throw error;
    }
  }

  async getRoutes() {
    const list = await this.cloudService.getRoutes();
    return list;
  }

  async favoriteRoute(journey) {
    try {
      const resultDatabase = await this.cloudService.favoriteJourney(journey);
      return resultDatabase;
    } catch (error) {
      // Reenviar excepción recibida

      throw error;
    }
  }

  async removeRoute(journey) {
    try {
      const resultDatabase = await this.cloudService.deleteJourney(journey);
      return resultDatabase;
    } catch (error) {
      // Reenviar excepción recibida
      throw error;
    }
  }
}
