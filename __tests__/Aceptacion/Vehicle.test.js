import Vehicle from '../../models/Vehicle';
import VehicleController from '../../controllers/VehicleController';
import cloudService from '../../services/cloudService';
import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

const CloudService = new cloudService('test');
const vehicleController = new VehicleController(CloudService);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

afterEach(async () => {
  await CloudService.clearCollection('vehicles');
  await jest.clearAllMocks();
  await AsyncStorage.removeItem('vehicles');
});

describe('HU9: Como usuario quiero poder dar de alta un vehículo para poder emplearlo como método de transporte en mis rutas', () => {
  it('E1: Se crea el vehículo correctamente con datos válidos', async () => {
    const creatorEmail = 'usuario@gmail.com';

    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 10, '1171MSL', 'gasoline');

    await expect(vehicleController.registerVehicle(vehicle)).resolves.toBeTruthy();
    await expect(AsyncStorage.getItem).toBeCalledWith('vehicles');
    await expect(AsyncStorage.setItem).toBeCalled();
  });

  it('E2: No se crea el vehículo si ya está dado de alta', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 5, '8171MSL', 'gasoline');

    //Agregamos el vehiculo
    await vehicleController.registerVehicle(vehicle)
    // Intenta agregar el mismo vehiculo
    await expect(vehicleController.registerVehicle(vehicle)).rejects.toThrow('DuplicateVehicleException');
  });

  it('E3: No se crea el vehículo si el año no es válido', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 1500, 5, '1171MSL', 'gasoline');

    await expect(vehicleController.registerVehicle(vehicle)).rejects.toThrow(
      'YearNotValidException',
    );
  });
});


describe('HU10:  Como usuario quiero poder consultar la lista de vehículos dados de alta.', () => {
  it('E1: Se muestra la lista de vehiculos disponibles si los hay.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 5, '8171MSL', 'gasoline');
    await vehicleController.registerVehicle(vehicle)

    
    const storedData = await vehicleController.getVehicles();
    expect(storedData).toEqual([
      vehicle
    ]);
  });

  it('E2: No se muestra la lista de vehiculos registrados si no los hay.', async () => {

    const storedData = await vehicleController.getVehicles();
    expect(storedData).toEqual([]);
  });
});


describe('HU11: Como usuario quiero poder eliminar un vehículo cuando ya no vaya a utilizarlo más.', () => {
  it('E1: Se elimina el vehiculo correctamente.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 5, '8171MSL', 'gasoline');
    await vehicleController.registerVehicle(vehicle)

    await expect(
      vehicleController.removeVehicle(vehicle),
    ).resolves.toBeTruthy();
    
  });

  it('E2: Se intenta eliminar un vehiculo que no existe.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 5, '8171MSL', 'gasoline');

    await expect(
      vehicleController.removeVehicle(vehicle),
    ).rejects.toThrow('VehicleNotFoundException');
  });
});

describe('HU12: Como usuario quiero poder cambiar los datos de un vehículo para poder actualizar su información.', () => {
  it('E1: Los datos del vehículo se actualizan correctamente.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 5, '8171MSL', 'gasoline');
    await vehicleController.registerVehicle(vehicle);

    const updatedVehicle = new Vehicle(creatorEmail, 'Ford', 'Fiesta', 2018, 2, '8171MSL', 'gasoline');
    await expect(
      vehicleController.updateVehicle(updatedVehicle),
    ).resolves.toBeTruthy();
  });

  it('E2: Intenta actualizar un vehículo que no existe.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 5, '8171MSL', 'gasoline');

    await expect(
      vehicleController.updateVehicle(vehicle),
    ).rejects.toThrow('VehicleNotFoundException');
  });
});

describe('HU20: Como usuario quiero poder marcar como favorito vehiculos para que aparezcan los primeros cuando los listo.', () => {
  it('E1: Se marca como favorito un vehiculo existente.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const vehicle1 = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 5, '8171MSL', 'gasoline');
    const vehicle2 = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 1999, 5, '3774MSL', 'diesel');
    await vehicleController.registerVehicle(vehicle1);
    await vehicleController.registerVehicle(vehicle2);
    await vehicleController.favoriteVehicle(vehicle2)
    const storedData = await vehicleController.getVehicles();
    expect(storedData[0]).toEqual(
      {
        ...vehicle2,
        isFavorite: true,
      }
    );
  });

  it('E2: Se intenta marcar como favorito vehiculos que no existe.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const vehicle = new Vehicle(creatorEmail, 'Toyota', 'Corolla', 2020, 5, '8171MSL', 'gasoline');


    await expect(
      vehicleController.favoriteVehicle(vehicle),
    ).rejects.toThrow('VehicleNotFoundException');
  
  });
});