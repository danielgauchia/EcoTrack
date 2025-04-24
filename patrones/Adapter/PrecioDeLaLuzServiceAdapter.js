import axios from 'axios';
import PrecioElectricidadService from './PrecioElectricidadService';

export default class PrecioDeLaLuzServiceAdapter extends PrecioElectricidadService {
  async obtenerPrecioElectricidad() {
    try {
      // Realizar la petición GET a la API
      const response = await axios.get(
        'https://api.preciodelaluz.org/v1/prices/now?zone=PCB',
      );

      // Extraer el precio de la respuesta
      const precio = response.data.price;

      // Devolver el precio
      return precio;
    } catch (error) {
      // Manejar posibles errores
      const er = new Error('DatabaseNotAvailableException');
      er.code = 'DatabaseNotAvailableException';
      throw er;
    }
  }
}
