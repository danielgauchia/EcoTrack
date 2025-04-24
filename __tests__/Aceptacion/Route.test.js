import RouteController from '../../controllers/RouteController';
import Route from '../../models/Route';
import Vehicle from '../../models/Vehicle';
import InterestPoint from '../../models/InterestPoint';
import Journey from '../../models/Journey';
import cloudService from '../../services/cloudService';
import GoogleDirectionsServiceAdapter from '../../patrones/Adapter/GoogleDirectionsServiceAdapter';
import DatosGobServiceAdapter from '../../patrones/Adapter/DatosGobServiceAdapter';
import PrecioDeLaLuzServiceAdapter from '../../patrones/Adapter/PrecioDeLaLuzServiceAdapter';
import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';


jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

afterEach(async () => {
  await CloudService.clearCollection('journeys');
  await jest.clearAllMocks();
  await AsyncStorage.removeItem('journeys');
});

const CloudService = new cloudService('test');
const routeService = new GoogleDirectionsServiceAdapter();
const carburanteService = new DatosGobServiceAdapter();
const precioLuzService = new PrecioDeLaLuzServiceAdapter();
const routeController = new RouteController(CloudService, routeService, carburanteService, precioLuzService);

//Estos tests seguramente fallen en github ya que no comiteamos nuestra apiKey al repositorio, es lo que se espera
describe('HU13: Como usuario, dados dos lugares de interés y un método de movilidad, quiero obtener una ruta entre ambos lugares', () => {
    it('E1: Se obtiene la ruta correctamente', async () => {
      const creatorEmail = 'usuario@gmail.com';
      const interestPoint1 = new InterestPoint(creatorEmail, 'Villarreal', 39.9333300, -0.1000000);
      const interestPoint2 = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39.98567, -0.04935);
      const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'gasoline');
      const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'fastest');
  
      await expect(routeController.getRoute(route)).resolves.toBeTruthy();

    });
  
    it('E2: Uno de los lugares no existe', async () => {
      const creatorEmail = 'usuario@gmail.com';
      const interestPoint1 = new InterestPoint(creatorEmail, 'Villarreal', 39.9333300, -0.1000000);
      const interestPoint2 = new InterestPoint(creatorEmail, '', undefined, undefined)
      const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'gasoline');
      const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'shortest');
  
      await expect(routeController.getRoute(route)).rejects.toThrow(
        'InvalidInterestPointException',
      );
    });
  

});
  
describe('HU14: Como usuario quiero conocer el coste asociado a la realización de una ruta en coche (precio de combustible) para saber cuánto me va a costar.', () => {
  it('E1: Se calcula el coste correctamente', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(creatorEmail, 'Villarreal', 39.9333300, -0.1000000);
    const interestPoint2 = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39.98567, -0.04935);
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'gasoline');
    const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'fastest');

    const journey = await routeController.getRoute(route)
    const price = await routeController.getPrice(journey, route)
    // Verifica que cost no es null y es un número
    expect(price).not.toBeNull();
    expect(typeof price).toEqual('number');

  });

  it('E2: Vehiculo no válido', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(creatorEmail, 'Villarreal', 39.9333300, -0.1000000);
    const interestPoint2 = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39.98567, -0.04935);
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'plutonium');
    const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'shortest');
    const journey = await routeController.getRoute(route)

    await expect(routeController.getPrice(journey, route)).rejects.toThrow(
      'InvalidVehicleException',
    );
  });
});

describe('HU15: Como usuario quiero conocer el coste asociado a la realización de una ruta a pie o en bicicleta (calorías).', () => {
  it('E1: Se calcula el coste correctamente', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(creatorEmail, 'Villarreal', 39.9333300, -0.1000000);
    const interestPoint2 = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39.98567, -0.04935);
    const vehicle = new Vehicle(creatorEmail, 'Generic', 'Generic', 2020, 10, 'GENERIC', 'walking');
    const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'fastest');

    const journey = await routeController.getRoute(route);
    const calories = await routeController.getPrice(journey, route);
    
    // Verifica que se devuelva un valor válido de calorías
    expect(calories).not.toBeNull();
    expect(typeof calories).toEqual('number');
  });
  it('E2: Ruta no disponible', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(creatorEmail, 'Villarreal', 39.9333300, -0.1000000);
    const interestPoint2 = new InterestPoint(creatorEmail, '', undefined, undefined)
    const vehicle = new Vehicle(creatorEmail, 'Generic', 'Generic', 2020, 10, 'GENERIC', 'walking');
    const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'shortest');

    await expect(routeController.getRoute(route)).rejects.toThrow(
      'InvalidInterestPointException',
    );
  });
});

describe('HU16: Como usuario quiero conocer la ruta más recomendada/rápida/corta/económica entre dos puntos.', () => {
  it('E1: Se muestra la ruta más recomendada/rápida/corta/económica', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(creatorEmail, 'Valencia', 39.4697500, -0.3773900);
    const interestPoint2 = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39.98567, -0.04935);
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'electric');
    const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'fastest');
    const route2 = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'economic');

    const fastJourney = await routeController.getRoute(route)
    const economicJourney = await routeController.getRoute(route2)
    // Verifica que ambas rutas son válidas y diferentes
    expect(fastJourney).toBeTruthy();
    expect(economicJourney).toBeTruthy();
    expect(fastJourney).not.toEqual(economicJourney);
  
    const priceRoute1 = await routeController.getPrice(fastJourney, route)
    const priceRoute2 = await routeController.getPrice(economicJourney, route2)
    // Verifica propiedades específicas de cada ruta
    expect(priceRoute2).toBeLessThanOrEqual(priceRoute1);
    expect(fastJourney.duration).toBeLessThan(economicJourney.duration);
  

  });

  it('E2: Uno de los lugares no existe', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(creatorEmail, 'Villarreal', 39.9333300, -0.1000000);
    const interestPoint2 = new InterestPoint(creatorEmail, '', undefined, undefined)
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'gasoline');
    const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'shortest');

    await expect(routeController.getRoute(route)).rejects.toThrow(
      'InvalidInterestPointException',
    );
  });


});

describe('HU17: Como usuario quiero poder guardar una ruta para visualizarla más adelante.', () => {
  it('E1: La ruta se guarda correctamente', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(creatorEmail, 'Valencia', 39.4697500, -0.3773900);
    const interestPoint2 = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39.98567, -0.04935);
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'electric');
    const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'fastest');
    
    const fastJourney = await routeController.getRoute(route)
    const priceRoute1 = await routeController.getPrice(fastJourney, route)

    const journeyToStore = new Journey(creatorEmail,fastJourney.coordinates, fastJourney.distance, fastJourney.duration, priceRoute1, 'Cs-Valencia', 'electric')
    await expect(routeController.storeJourney(journeyToStore)).resolves.toBeTruthy();
    await expect(AsyncStorage.getItem).toBeCalledWith('journeys');
    await expect(AsyncStorage.setItem).toBeCalled();

  });

  it('E2: Ya existe una ruta con ese nombre', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(creatorEmail, 'Valencia', 39.4697500, -0.3773900);
    const interestPoint2 = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39.98567, -0.04935);
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'electric');
    const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'fastest');
    
    const fastJourney = await routeController.getRoute(route)
    const priceRoute1 = await routeController.getPrice(fastJourney, route)

    const journeyToStore = new Journey(creatorEmail,fastJourney.coordinates, fastJourney.distance, fastJourney.duration, priceRoute1, 'Cs-Valencia', 'electric')
    await routeController.storeJourney(journeyToStore)
    await expect(routeController.storeJourney(journeyToStore)).rejects.toThrow(
      'JourneyAlreadyStoredException',
    );
    
  });


});

describe('HU18: Como usuario quiero poder consultar el listado de rutas guardadas.', () => {
  it('E1: Se muestra la lista de rutas disponibles si las hay.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(creatorEmail, 'Valencia', 39.4697500, -0.3773900);
    const interestPoint2 = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39.98567, -0.04935);
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'electric');
    const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'fastest');
    
    const fastJourney = await routeController.getRoute(route)
    const priceRoute1 = await routeController.getPrice(fastJourney, route)

    const journeyToStore = new Journey(creatorEmail,fastJourney.coordinates, fastJourney.distance, fastJourney.duration, priceRoute1, 'Cs-Valencia', 'electric')
    await expect(routeController.storeJourney(journeyToStore)).resolves.toBeTruthy();
    await expect(AsyncStorage.getItem).toBeCalledWith('journeys');
    await expect(AsyncStorage.setItem).toBeCalled();

    const storedData = await routeController.getRoutes();
    expect(storedData).toEqual([
      journeyToStore
    ]);
  });

  it('E2: No se muestra la lista de rutas registradas si no las hay.', async () => {
    
    const storedData = await routeController.getRoutes();
    expect(storedData).toEqual([]);
  });
    
  


});

describe('HU20: Como usuario quiero poder marcar como favorito rutas para que aparezcan las primeras cuando las listo.', () => {
  it('E1: Se marca como favorito una ruta existente.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(creatorEmail, 'Valencia', 39.4697500, -0.3773900);
    const interestPoint2 = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39.98567, -0.04935);
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'electric');
    const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'fastest');
    const route2 = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'economic');

    const fastJourney = await routeController.getRoute(route)
    const economicJourney = await routeController.getRoute(route2)

    const priceRoute1 = await routeController.getPrice(fastJourney, route)
    const priceRoute2 = await routeController.getPrice(fastJourney, route2)

    const journeyToStore = new Journey(creatorEmail, fastJourney.coordinates, fastJourney.distance, fastJourney.duration, priceRoute1, 'Cs-ValenciaFAST', 'electric')
    const journeyToStore2 = new Journey(creatorEmail, economicJourney.coordinates, economicJourney.distance, economicJourney.duration, priceRoute2, 'Cs-ValenciaECO', 'electric')
    
    await expect(routeController.storeJourney(journeyToStore)).resolves.toBeTruthy();
    await expect(routeController.storeJourney(journeyToStore2)).resolves.toBeTruthy();

    await routeController.favoriteRoute(journeyToStore2)

    const storedData = await routeController.getRoutes();
    expect(storedData[0]).toEqual(
      {
        ...journeyToStore2,
        isFavorite: true,
      }
    );
  });

  it('E2: Se intenta marcar como favorita una ruta que no existe.', async () => {
     const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(creatorEmail, 'Valencia', 39.4697500, -0.3773900);
    const interestPoint2 = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39.98567, -0.04935);
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'electric');
    const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'fastest');
    const fastJourney = await routeController.getRoute(route)


    const priceRoute1 = await routeController.getPrice(fastJourney, route)
    const journeyToStore = new Journey(creatorEmail, fastJourney.coordinates, fastJourney.distance, fastJourney.duration, priceRoute1, 'Cs-ValenciaFAST', 'electric')

    await expect(
      routeController.favoriteRoute(journeyToStore),
    ).rejects.toThrow('JourneyNotFoundException');
  
  });
});



describe('HU19: Como usuario quiero poder eliminar una ruta guardada cuando ya no me resulta de utilidad.', () => {
  it('E1: Se elimina la ruta exitosamente.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(creatorEmail, 'Valencia', 39.4697500, -0.3773900);
    const interestPoint2 = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39.98567, -0.04935);
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'electric');
    const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'fastest');
    
    const fastJourney = await routeController.getRoute(route)
    const priceRoute1 = await routeController.getPrice(fastJourney, route)

    const journeyToStore = new Journey(creatorEmail,fastJourney.coordinates, fastJourney.distance, fastJourney.duration, priceRoute1, 'Cs-Valencia', 'electric')
    await expect(routeController.storeJourney(journeyToStore)).resolves.toBeTruthy();
    await expect(AsyncStorage.getItem).toBeCalledWith('journeys');
    await expect(AsyncStorage.setItem).toBeCalled();

    await expect(
      routeController.removeRoute(journeyToStore),
    ).resolves.toBeTruthy();

    const storedData = await routeController.getRoutes();
    expect(storedData).toEqual([]);
  });

  it('E2: Se intenta eliminar una ruta que no existe.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(creatorEmail, 'Valencia', 39.4697500, -0.3773900);
    const interestPoint2 = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39.98567, -0.04935);
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'electric');
    const route = new Route(creatorEmail, interestPoint1, interestPoint2, vehicle, 'fastest');
    
    const fastJourney = await routeController.getRoute(route)
    const priceRoute1 = await routeController.getPrice(fastJourney, route)

    const journeyToStore = new Journey(creatorEmail,fastJourney.coordinates, fastJourney.distance, fastJourney.duration, priceRoute1, 'Cs-Valencia', 'electric')

    await expect(
      routeController.removeRoute(journeyToStore),
    ).rejects.toThrow('JourneyNotFoundException');
  });
    
  


});