export const mockAddDoc = jest.fn();

//Simulamos que este vehiculo y que este punto ya existen en nuestra base de datos.
const existingVehicle = {
  creator: 'usuario@gmail.com',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  averageConsumption: 5,
  plate: '8171MSL',
  type: 'gasoline'
};
const existingInterestPoint = {
  creator: 'usuario@gmail.com',
  name: 'Castellón de la Plana',
  latitude: 39,
  longitude: 0,
};

const cloudServiceMock = {
  addVehicle: vehicle => {
    // Simular añadir el vehículo a la colección 'vehicles'
    return mockAddDoc('vehicles', vehicle);
  },
  addInterestPoint: interestPoint => {
    // Simular añadir el punto de interés a la colección 'interestPoints'
    return mockAddDoc('interestPoints', interestPoint);
  },
};

mockAddDoc.mockImplementation((collection, data) => {
  // Comprobamos si los datos del nuevo vehículo coinciden con el vehículo existente
  if (
    collection === 'vehicles' &&
    data.plate === existingVehicle.plate 
  ) {
    return Promise.reject(new Error('DuplicateVehicleException'));
  }

  // Comprobamos si el toponimo del nuevo punto de interés ya existe en la base de datos
  if (
    collection === 'interestPoints' &&
    data.name === existingInterestPoint.name &&
    data.creator === existingInterestPoint.creator
  ) {
    return Promise.reject(new Error('DuplicateInterestPointException'));
  }

  // Si no es un duplicado, simular la creación exitosa del documento
  return Promise.resolve({id: 'random-doc-id', ...data});
});

export default cloudServiceMock;
