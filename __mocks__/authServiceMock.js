export const mockCreateUserWithEmailAndPassword = jest.fn();
export const mockSignInWithEmailAndPassword = jest.fn();
export const mockDeleteUser = jest.fn();

// Simula el comportamiento de Firebase Auth para registrar un usuario
mockCreateUserWithEmailAndPassword.mockImplementation((email, password) => {
  // Simula un registro exitoso
  return Promise.resolve({user: {email, password}});
});

// Simula el comportamiento de Firebase Auth para iniciar sesión
mockSignInWithEmailAndPassword.mockImplementation((email, password) => {
  // En este punto, simulas que la base de datos tiene un usuario con ese email y password
  // Simula un inicio de sesión exitoso
  return Promise.resolve({user: {email, password}});
});

// Simula el comportamiento de Firebase para borrar un usuario
mockDeleteUser.mockImplementation((email, password) => {
  // En este punto, simulas que la base de datos tiene un usuario con ese email y password
  // Simula un borrado de usuario exitoso
  return Promise.resolve({user: {email, password}});
});

const authServiceMock = {
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  deleteUser: mockDeleteUser,
};

export default authServiceMock;
