import axios from 'axios';
import PrecioCarburanteService from './PrecioCarburanteService';

export default class DatosGobServiceAdapter extends PrecioCarburanteService {
  async obtenerPrecioCarburante(vehicleType, origin) {
    try {
      
      const response = await axios.get('https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/');
      const estacionEncontrada = this.encontrarEstacionEnRango(response.data.ListaEESSPrecio, origin);

      let precio;
      if (vehicleType === 'gasoline') {
        precio = parseFloat(estacionEncontrada['Precio Gasolina 95 E5'].replace(',', '.'));
      } else if (vehicleType === 'diesel') {
        precio = parseFloat(estacionEncontrada['Precio Gasoleo A'].replace(',', '.'));
      }
      
      return precio;
    } catch (error) {
      // Manejar posibles errores
      const er = new Error('DatabaseNotAvailableException');
      er.code = 'DatabaseNotAvailableException';
      throw er;
    }
  }

  encontrarEstacionEnRango(estaciones, origin, rango = 0.1) {
    for (const estacion of estaciones) {
      const latitud = parseFloat(estacion.Latitud.replace(',', '.'));
      const longitud = parseFloat(estacion['Longitud (WGS84)'].replace(',', '.'));

      // Verifica si la estación está dentro del rango de proximidad (aproximadamente 11 km)
      if (Math.abs(origin.latitude - latitud) <= rango && Math.abs(origin.longitude - longitud) <= rango) {
        return estacion; // Devuelve la primera estación que cumpla con el criterio
      }
    }

    return null; // Devuelve null si no se encuentra ninguna estación en el rango
  }
}
