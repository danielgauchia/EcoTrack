// VehicleControllerContext.js
import React, { createContext, useContext } from 'react';
import VehicleController from '../controllers/VehicleController';
import cloudService from '../services/cloudService';

// Crear el contexto
const VehicleControllerContext = createContext(null);

// Crear un proveedor para el contexto
export const VehicleControllerProvider = ({ children }) => {
  
  //Crear una instancia de VehicleController
  const cloudProduction = new cloudService('production')
  const vehicleController = new VehicleController(cloudProduction)

  return (
    <VehicleControllerContext.Provider value={vehicleController}>
      {children}
    </VehicleControllerContext.Provider>
  );
};

// Hook personalizado para usar VehicleController
export const useVehicleController = () => {
  return useContext(VehicleControllerContext);
};

export default VehicleControllerContext;
