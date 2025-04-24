import axios from 'axios';
import RutaService from './RutaService';
import Config from 'react-native-config';
import NetInfo from '@react-native-community/netinfo';
export default class GoogleDirectionsServiceAdapter extends RutaService {
  constructor() {
    super();
    this.apiKey = Config.GOOGLE_MAPS_API_KEY;
  }

  async obtenerRuta(origin, destination, mode, vehicle) {
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;

    if (isConnected) {
      try {
        // Construye los objetos Waypoint para origin y destination
        const waypointOrigin = this.buildWaypoint(origin);
        const waypointDestination = this.buildWaypoint(destination);

        // Configura el tipo de vehículo
        const travelMode = this.getTravelMode(vehicle.type);

        // Realiza la solicitud a la API de Google Maps directions
        const response = await axios.post(
          `https://routes.googleapis.com/directions/v2:computeRoutes`,
          {
            origin: waypointOrigin,
            destination: waypointDestination,
            travelMode: travelMode,
            computeAlternativeRoutes: true,
            polylineQuality: 'HIGH_QUALITY',
          },
          {
            params: {
              key: this.apiKey,
            },
            headers: {
              'X-Goog-FieldMask':
                'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
            },
          },
        );

        return this.selectAppropriateRoute(response.data, mode);
      } catch (error) {
        throw error;
      }
    } else {
      const error = new Error('NoInetConection');
      error.code = 'NoInetConection';
      throw error;
    }
  }

  // Método para seleccionar la ruta adecuada
  selectAppropriateRoute(data, mode) {
    if (!data.routes || data.routes.length === 0) {
      const error = new Error('RouteNotAvailableException');
      error.code = 'RouteNotAvailableException';
      throw error;
    }

    let selectedRoute;
    if (mode === 'economic') {
      // Busca una ruta etiquetada como FUEL_EFFICIENT
      selectedRoute = data.routes.find(
        route => route.routeLabel === 'FUEL_EFFICIENT',
      );

      // Si no se encuentra una ruta FUEL_EFFICIENT, selecciona la de menor distancia
      if (!selectedRoute) {
        selectedRoute = data.routes.reduce((shortest, current) => {
          return !shortest || current.distanceMeters < shortest.distanceMeters
            ? current
            : shortest;
        }, null);
      }
    }

    // Si el modo no es económico, selecciona la primera ruta
    selectedRoute = selectedRoute || data.routes[0];

    return this.formatRouteResponse(selectedRoute);
  }

  // Método para construir un objeto Waypoint
  buildWaypoint(location) {
    if (location.latitude !== undefined && location.longitude !== undefined) {
      return {
        location: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      };
    } else {
      return {address: location.name};
    }
  }

  // Método para determinar el modo de viaje
  getTravelMode(vehicleType) {
    switch (vehicleType) {
      case 'electric':
      case 'gasoline':
      case 'diesel':
        return 'DRIVE';
      case 'bike':
        return 'BICYCLE';
      case 'walking':
        return 'WALK';
      default:
        return 'DRIVE';
    }
  }

  formatRouteResponse(route) {
    // Decodifica la polyline.
    const decodedPolyline = this.decodePolyline(route.polyline.encodedPolyline);

    // Construye el objeto de respuesta
    const response = {
      distance: route.distanceMeters, // Distancia en metros
      duration:  parseInt(route.duration.replace('s', ''), 10), // Duración en segundos
      coordinates: decodedPolyline, // Coordenadas de la ruta
    };

    return response;
  }

  // Método para decodificar una polyline codificada de Google Maps
  decodePolyline(encoded) {
    if (!encoded) {
      return [];
    }

    const poly = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push({latitude: lat / 1e5, longitude: lng / 1e5});
    }

    return poly;
  }
}
