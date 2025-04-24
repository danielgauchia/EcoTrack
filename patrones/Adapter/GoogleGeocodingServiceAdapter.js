import axios from 'axios';
import GeocodingService from './GeocodingService';
import Config from 'react-native-config';

export default class GoogleGeocodingServiceAdapter extends GeocodingService {
  constructor() {
    super();
    this.apiKey = Config.GOOGLE_MAPS_API_KEY;
  }

  async obtenerCoordenadas(toponym) {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: toponym,
            key: this.apiKey,
          },
        },
      );

      // Verifica si la respuesta es válida
      if (response.data.results.length === 0) {
        const error = new Error('InvalidToponymException');
        error.code = 'InvalidToponymException';
        throw error;
      }
      // Devuelve las coordenadas del primer resultado
      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } catch (error) {
      throw error;
    }
  }
}
