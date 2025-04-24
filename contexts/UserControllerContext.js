// UserControllerContext.js
import React, { createContext, useContext } from 'react';
import UserController from '../controllers/UserController';
import authService from '../services/authService';
import cloudService from '../services/cloudService';
// Crear el contexto
const UserControllerContext = createContext(null);

// Crear un proveedor para el contexto
export const UserControllerProvider = ({ children }) => {
  // Crear una instancia de UserController
  const authProduction = new authService('production')
  const cloudProduction = new cloudService('production')
  const userController = new UserController(authProduction, cloudProduction);

  return (
    <UserControllerContext.Provider value={userController}>
      {children}
    </UserControllerContext.Provider>
  );
};

// Hook personalizado para usar UserController
export const useUserController = () => {
  return useContext(UserControllerContext);
};

export default UserControllerContext;
