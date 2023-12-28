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
        return ''
      case 'walking':
        // Aquí podrías definir un precio o cálculo calórico para 'bike' y 'walking'
        return ''; // Ejemplo con precio = 0

      default:
        // Manejar cualquier otro tipo de vehículo no especificado
        const error = new Error('InvalidVehicleException');
        error.code = 'InvalidVehicleException';
        throw error;
    }
  }
}
