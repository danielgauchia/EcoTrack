import InterestPoint from '../../models/InterestPoint';
import cloudService from '../../services/cloudService';
import InterestPointController from '../../controllers/InterestPointController';
import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import GoogleGeocodingServiceAdapter from '../../patrones/Adapter/GoogleGeocodingServiceAdapter';
const CloudService = new cloudService('test');
const geocodingService = new GoogleGeocodingServiceAdapter();
const interestPointController = new InterestPointController(
  CloudService,
  geocodingService,
);
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

afterEach(async () => {
  // Vaciar la base de datos antes de cada prueba
  await CloudService.clearCollection('interestPoints');
  await jest.clearAllMocks();
  await AsyncStorage.removeItem('interestPoints');
});

describe('HU5: Como usuario quiero poder dar de alta un lugar de interés usando sus coordenadas', () => {
  it('E1: Se crea el lugar correctamente con coordenadas válidas', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(
      creatorEmail,
      'Villarreal',
      39.93333,
      -0.1,
    );
    await expect(
      interestPointController.registerInterestPoint(interestPoint),
    ).resolves.toBeTruthy();
    expect(AsyncStorage.getItem).toBeCalledWith('interestPoints');
    expect(AsyncStorage.setItem).toBeCalled();
  });

  it('E2: No se crea el lugar si el nombre ya está dado de alta (por el mismo usuario)', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(
      creatorEmail,
      'Castellón de la Plana',
      39,
      0,
    );

    await interestPointController.registerInterestPoint(interestPoint);

    // Intenta agregar el mismo punto de interés
    await expect(
      interestPointController.registerInterestPoint(interestPoint),
    ).rejects.toThrow('DuplicateInterestPointException');

    // Verifica que se haya llamado a getItem
    expect(AsyncStorage.getItem).toBeCalledWith('interestPoints');
  });

  it('E3: No se crea el lugar si las coordinadas no son válidas', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(creatorEmail, 'Plutón', -360, 360);
    await expect(
      interestPointController.registerInterestPoint(interestPoint),
    ).rejects.toThrow('InvalidCoordinatesException');
  });
});

describe('HU6: Como usuario quiero poder dar de alta un lugar de interés usando su topónimo', () => {
  it('E1: Se crea el lugar correctamente con un topónimo válido', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(creatorEmail, 'Vilareal');
    await expect(
      interestPointController.registerInterestPointToponym(interestPoint),
    ).resolves.toBeTruthy();
    expect(AsyncStorage.getItem).toBeCalledWith('interestPoints');
    expect(AsyncStorage.setItem).toBeCalled();
  });

  it('E2: No se crea el lugar si el topónimo ya está dado de alta (por el mismo usuario)', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(
      creatorEmail,
      'Castellón de la Plana',
    );
    await interestPointController.registerInterestPointToponym(interestPoint);

    // Intenta agregar el mismo punto de interés
    await expect(
      interestPointController.registerInterestPointToponym(interestPoint),
    ).rejects.toThrow('DuplicateInterestPointException');
  });

  it('E3: No se crea el lugar si el topónimo no es válido', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(creatorEmail, 'Plutón');
    await expect(
      interestPointController.registerInterestPointToponym(interestPoint),
    ).rejects.toThrow('InvalidToponymException');
  });
});

describe('HU7: Como usuario quiero poder consultar la lista de lugares de interés dados de alta.', () => {
  it('E1: Se muestra la lista de lugares de interes disponibles si los hay.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(
      creatorEmail,
      'Villarreal',
      39.93333,
      -0.1,
    );
    await interestPointController.registerInterestPoint(interestPoint);

    const storedData = await interestPointController.getInterestPoints();
    expect(storedData).toEqual([
      {
        creator: 'usuario@gmail.com',
        name: 'Villarreal',
        latitude: 39.93333,
        longitude: -0.1,
      },
    ]);
  });

  it('E2: No se muestra la lista de lugares de interes registrados si no los hay.', async () => {
    const storedData = await interestPointController.getInterestPoints();
    expect(storedData).toEqual([]);
  });
});

describe('HU8: Como usuario quiero poder eliminar un lugar de interés cuando no ya no voy a utilizarlo más.', () => {
  it('E1: Se elimina el lugar correctamente.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(
      creatorEmail,
      'Villarreal',
      39.93333,
      -0.1,
    );
    await interestPointController.registerInterestPoint(interestPoint);
    await expect(
      interestPointController.removeInterestPoint(interestPoint),
    ).resolves.toBeTruthy();
  });

  it('E2: Se intenta eliminar un lugar que no existe.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(
      creatorEmail,
      'Villarreal',
      39.93333,
      -0.1,
    );

    await expect(
      interestPointController.removeInterestPoint(interestPoint),
    ).rejects.toThrow('InterestPointNotFoundException');
  });
});

describe('HU20: Como usuario quiero poder marcar como favorito  lugares de interés para que aparezcan los primeros cuando los listo.', () => {
  it('E1: Se marca como favorito un punto de interés existente.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint1 = new InterestPoint(
      creatorEmail,
      'Villarreal',
      39.93333,
      -0.1,
    );
    const interestPoint2 = new InterestPoint(
      creatorEmail,
      'Castellón',
      39,
      0,
    );
    await interestPointController.registerInterestPoint(interestPoint1);
    await interestPointController.registerInterestPoint(interestPoint2);
    await interestPointController.favoriteInterestPoint(interestPoint2)
    const storedData = await interestPointController.getInterestPoints();
    expect(storedData[0]).toEqual(
      {
        ...interestPoint2,
        isFavorite: true,
      },
    );
  });

  it('E2: Se intenta marcar como favorito punto de interés que no existe.', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint2 = new InterestPoint(
      creatorEmail,
      'Castellón',
      39,
      0,
    );
    
    await expect(
      interestPointController.favoriteInterestPoint(interestPoint2),
    ).rejects.toThrow('InterestPointNotFoundException');
  });
});
