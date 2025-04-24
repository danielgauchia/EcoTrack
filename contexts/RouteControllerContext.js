import React, {createContext, useContext} from 'react';
import RouteController from '../controllers/RouteController';
import cloudService from '../services/cloudService';
import GoogleDirectionsServiceAdapter from '../patrones/Adapter/GoogleDirectionsServiceAdapter';
import DatosGobServiceAdapter from '../patrones/Adapter/DatosGobServiceAdapter';
import PrecioDeLaLuzServiceAdapter from '../patrones/Adapter/PrecioDeLaLuzServiceAdapter';

// Crear el contexto
const RouteControllerContext = createContext(null);

// Crear un proveedor para el contexto
export const RouteControllerProvider = ({children}) => {
  // Crear una instancia de RouteController
  const cloudProduction = new cloudService('production');
  const routeService = new GoogleDirectionsServiceAdapter();
  const carburanteService = new DatosGobServiceAdapter();
  const precioLuzService = new PrecioDeLaLuzServiceAdapter();

  const routeController = new RouteController(
    cloudProduction,
    routeService,
    carburanteService,
    precioLuzService,
  );

  return (
    <RouteControllerContext.Provider value={routeController}>
      {children}
    </RouteControllerContext.Provider>
  );
};

// Hook personalizado para usar RouteController
export const useRouteController = () => {
  return useContext(RouteControllerContext);
};

export default RouteControllerContext;
