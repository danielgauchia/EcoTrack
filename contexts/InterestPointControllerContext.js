// InterestPointControllerContext.js
import React, { createContext, useContext } from 'react';
import InterestPointController from '../controllers/InterestPointController';
import cloudService from '../services/cloudService';
import GoogleGeocodingServiceAdapter from '../patrones/Adapter/GoogleGeocodingServiceAdapter';

// Crear el contexto
const InterestPointControllerContext = createContext(null);

// Crear un proveedor para el contexto
export const InterestPointControllerProvider = ({ children }) => {
  // Crear una instancia de InterestPointController
  const cloudProduction = new cloudService('production')
  const geocodingService = new GoogleGeocodingServiceAdapter();
  const interestPointController = new InterestPointController(cloudProduction, geocodingService);

  return (
    <InterestPointControllerContext.Provider value={interestPointController}>
      {children}
    </InterestPointControllerContext.Provider>
  );
};

// Hook personalizado para usar InterestPointController
export const useInterestPointController = () => {
  return useContext(InterestPointControllerContext);
};

export default InterestPointControllerContext;
