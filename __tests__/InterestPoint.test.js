import InterestPoint from '../models/InterestPoint';
import cloudServiceMock from '../__mocks__/cloudServiceMock';

describe('HU5: Como usuario quiero poder dar de alta un lugar de interés usando sus coordenadas', () => {
  it('E1: Se crea el lugar correctamente con coordenadas válidas', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(creatorEmail, 'Villarreal', 39.9333300, -0.1000000,  cloudServiceMock);
    await expect(interestPoint.register()).resolves.toEqual({
      id: 'random-doc-id',
      creator: creatorEmail,
      name: 'Villarreal',
      latitude: 39.9333300,
      longitude: -0.1000000,
    });
  });

  it('E2: No se crea el lugar si el topónimo ya está dado de alta', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(creatorEmail, 'Castellón de la Plana', 39, 0, cloudServiceMock);
    await expect(interestPoint.register()).rejects.toThrow('DuplicateInterestPointException');
  });
    
  it('E3: No se crea el lugar si las coordinadas no son válidas', async () => {
    const creatorEmail = 'usuario@gmail.com';
    const interestPoint = new InterestPoint(creatorEmail, 'Plutón', -360, 360, cloudServiceMock);
    await expect(interestPoint.register()).rejects.toThrow('InvalidCoordinatesException');
  });
});