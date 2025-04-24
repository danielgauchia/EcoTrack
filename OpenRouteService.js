import axios from 'axios';

const apiKey = '5b3ce3597851110001cf624890104ad5d8c9453d90c93dcd210dc008'; // La clave API
//vehiculos: driving-car, cycling-regular, foot-walking
export const calculateRoute = async (start, end, vehicle) => {
  try {
    const response = await axios.get(
      `https://api.openrouteservice.org/v2/directions/${vehicle}?api_key=${apiKey}&start=${start}&end=${end}`,
    );
    return response.data;
  } catch (error) {
    throw new Error('Algo salió mal');
  }
};

export const geoCoding = async name => {
  try {
    const response = await axios.get(
      `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${name}`,
    );
    const location = response.data.features[0].geometry.coordinates;
    return {latitude: location[1], longitude: location[0]};
  } catch (error) {
    throw new Error('Algo salió mal');
  }
};
