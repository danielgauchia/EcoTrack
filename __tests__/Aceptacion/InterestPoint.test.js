import InterestPoint from '../../models/InterestPoint';
import cloudService from '../../services/cloudService';
import InterestPointController from '../../controllers/InterestPointController';
import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import GoogleGeocodingServiceAdapter from '../../patrones/Adapter/GoogleGeocodingServiceAdapter';
const CloudService = new cloudService('test')
const geocodingService = new GoogleGeocodingServiceAdapter();
const interestPointController = new InterestPointController(CloudService, geocodingService);
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
beforeEach(async () => {
  // Vaciar la base de datos antes de cada prueba
  await CloudService.clearCollection('interestPoints');
  jest.clearAllMocks();
});


/*
describe('HU5: Como usuario quiero poder dar de alta un lugar de interés usando sus coordenadas', () => {
  it('E1: Se crea el lugar correctamente con coordenadas válidas', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(creatorEmail, 'Villarreal', 39.9333300, -0.1000000);
    await expect(interestPointController.registerInterestPoint(interestPoint)).resolves.toBeTruthy()
    expect(AsyncStorage.getItem).toBeCalledWith('interestPoints');
    expect(AsyncStorage.setItem).toBeCalled();
  });

  it('E2: No se crea el lugar si el nombre ya está dado de alta (por el mismo usuario)', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39, 0);
    
    // Configura el mock de AsyncStorage para simular que ya existe el punto de interés
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([interestPoint]));

    // Intenta agregar el mismo punto de interés
    await expect(interestPointController.registerInterestPoint(interestPoint)).rejects.toThrow('DuplicateInterestPointException');

    // Verifica que se haya llamado a getItem y setItem correctamente
    expect(AsyncStorage.getItem).toBeCalledWith('interestPoints');
    expect(AsyncStorage.setItem).not.toBeCalled();
  });
    
  it('E3: No se crea el lugar si las coordinadas no son válidas', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(creatorEmail, 'Plutón', -360, 360);
    await expect(interestPointController.registerInterestPoint(interestPoint)).rejects.toThrow('InvalidCoordinatesException');
  });
});
*/
describe('HU6: Como usuario quiero poder dar de alta un lugar de interés usando su topónimo', () => {
  it('E1: Se crea el lugar correctamente con un topónimo válido', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(creatorEmail, 'Villarreal');
    await expect(interestPointController.registerInterestPointToponym(interestPoint)).resolves.toBeTruthy()
    expect(AsyncStorage.getItem).toBeCalledWith('interestPoints');
    expect(AsyncStorage.setItem).toBeCalled();
  });

  it('E2: No se crea el lugar si el topónimo ya está dado de alta (por el mismo usuario)', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(creatorEmail, 'Castellón de la Plana');
    
    // Configura el mock de AsyncStorage para simular que ya existe el punto de interés
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([interestPoint]));

    // Intenta agregar el mismo punto de interés
    await expect(interestPointController.registerInterestPointToponym(interestPoint)).rejects.toThrow('DuplicateInterestPointException');

    // Verifica que se haya llamado a getItem y setItem correctamente
    expect(AsyncStorage.getItem).toBeCalledWith('interestPoints');
    expect(AsyncStorage.setItem).not.toBeCalled();
  });
    
  it('E3: No se crea el lugar si el topónimo no es válido', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(creatorEmail, 'Plutón');
    await expect(interestPointController.registerInterestPointToponym(interestPoint)).rejects.toThrow('InvalidToponymException');
  });
});