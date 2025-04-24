import firebaseInstance from '../firebase';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  signInWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth';
import {addDoc, collection} from 'firebase/firestore';
class AuthService {
  constructor(env) {
    this.auth = firebaseInstance.auth;
    this.db = firebaseInstance.db;
    this.env = env; // 'test' o 'production'
  }
  get usersCollection() {
    return collection(this.db, `${this.env}_users`);
  }

  async createUserWithEmailAndPassword(email, username, password) {
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;
    if (isConnected) {
      try {
        const res = await createUserWithEmailAndPassword(
          this.auth,
          email,
          password,
        );
        const user = res.user;

        // Añadir el documento y capturar el resultado
        const docRef = await addDoc(this.usersCollection, {
          uid: user.uid,
          username,
          email,
        });

        // Definir el objeto userInfo para almacenamiento local, incluyendo el id del documento
        const userInfo = {
          id: docRef.id, // Incluir el id del documento
          uid: user.uid,
          username,
          email,
        };

        // Guardar userInfo en el almacenamiento local
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));

        await signOut(this.auth);

        return user;
      } catch (error) {
        // Manejo de errores específicos de Firebase
        throw error;
      }
    } else {
      const error = new Error('NoInetConection');
      error.code = 'NoInetConection';
      throw error;
    }
  }

  async signInWithEmailAndPassword(email, password) {
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;
    if (isConnected) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          this.auth,
          email,
          password,
        );

        const userLocal = userCredential.user;

        // Otras operaciones necesarias después del inicio de sesión
        //Logeamos y guardamos el perfil en la base de datos local
        await AsyncStorage.setItem('user', JSON.stringify(userLocal));
        return userLocal;
      } catch (error) {
        // Manejo de errores específicos de Firebase
        throw error;
      }
    } else {
      const error = new Error('NoInetConection');
      error.code = 'NoInetConection';
      throw error;
    }
  }

  async deleteUser() {
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;
    if (isConnected) {
      if (this.auth.currentUser) {
        await deleteUser(this.auth.currentUser);
        return true;
      } else {
        const error = new Error('UserNotLoggedException');
        error.code = 'UserNotLoggedException';
        throw error;
      }
    } else {
      const error = new Error('NoInetConection');
      error.code = 'NoInetConection';
      throw error;
    }
  }

  async logout() {
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;

    if (isConnected) {
      if (this.auth.currentUser) {
        await signOut(this.auth);
        return true;
      } else {
        const error = new Error('UserNotLoggedException');
        error.code = 'UserNotLoggedException';
        throw error;
      }
    } else {
      const error = new Error('NoInetConection');
      error.code = 'NoInetConection';
      throw error;
    }
  }
}

export default AuthService;
