import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseInstance from '../firebase';
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  doc
} from 'firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
const AsyncStorageContext = createContext(null);

export const AsyncStorageProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const [interestPoints, setInterestPoints] = useState(null);
  const [journeys, setJourneys] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loaded, setLoaded] = useState(null);
  const loadInitialData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedVehicles = await AsyncStorage.getItem('vehicles');
      const storedInterestPoints = await AsyncStorage.getItem('interestPoints');
      const storedUserInfo = await AsyncStorage.getItem('userInfo');
      const storedJourneys = await AsyncStorage.getItem('journeys');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
      if (storedVehicles) {
        setVehicles(JSON.parse(storedVehicles));
      }
      if (storedInterestPoints) {
        setInterestPoints(JSON.parse(storedInterestPoints));
      }
      if (storedJourneys) {
        setJourneys(JSON.parse(storedJourneys))
      }

      setLoaded(true);
    } catch (error) {
      console.error('Failed to load data from AsyncStorage:', error);
    }
  };

  const getFirebaseData = async () => {
    const db = firebaseInstance.db;
    const userEmail = user.email;

    const userInfoQuery = query(
      collection(db, 'production_users'),
      where('email', '==', userEmail),
    );
    const vehicleQuery = query(
      collection(db, 'production_vehicles'),
      where('creator', '==', userEmail),
    );
    const interestPointQuery = query(
      collection(db, 'production_interestPoints'),
      where('creator', '==', userEmail),
    );
    const journeyQuery = query(
      collection(db, 'production_journeys'),
      where('creator', '==', userEmail),
    );

    const firebaseVehicles = await getDocs(vehicleQuery).then(querySnapshot =>
      querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})),
    );
    const firebaseInterestPoints = await getDocs(interestPointQuery).then(
      querySnapshot =>
        querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})),
    );
    const firebaseJourneys = await getDocs(journeyQuery).then(
      querySnapshot =>
        querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})),
    );
    const firebaseUserInfoDocs = await getDocs(userInfoQuery);
    const firebaseUserInfo = firebaseUserInfoDocs.docs[0]
      ? {
          id: firebaseUserInfoDocs.docs[0].id,
          ...firebaseUserInfoDocs.docs[0].data(),
        }
      : null;

    return {firebaseVehicles, firebaseInterestPoints, firebaseUserInfo, firebaseJourneys};
  };

  const syncData = async (
    localVehicles,
    localInterestPoints,
    localUserInfo,
    localJourneys
  ) => {
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;
    if (!isConnected) {
      return;
    }
    const {firebaseVehicles, firebaseInterestPoints, firebaseUserInfo, firebaseJourneys} =
      await getFirebaseData();
    const db = firebaseInstance.db;
    //Si no existe coleccion local pero si online es que el usuario ha borrado aplicacion y ha vuelto a instalar
    if (!localUserInfo && firebaseUserInfo) {
      //Hacer una copia de firebaseVehicles pero sin incluir el id en cada vehicle
      
      //guardarlo en asyncstorage y en el state
      await AsyncStorage.setItem('userInfo', JSON.stringify(firebaseUserInfo));
      setUserInfo(firebaseUserInfo);
    }
    //Si no existe coleccion local pero si online es que el usuario ha borrado aplicacion y ha vuelto a instalar
    if (!localVehicles && firebaseVehicles.length > 0) {
      //Hacer una copia de firebaseVehicles pero sin incluir el id en cada vehicle
      const vehiclesWithoutId = firebaseVehicles.map(({id, ...rest}) => rest);
      //guardarlo en asyncstorage y en el state
      await AsyncStorage.setItem('vehicles', JSON.stringify(vehiclesWithoutId));
      setVehicles(vehiclesWithoutId);
    }
    //Si no existe coleccion local pero si online es que el usuario ha borrado aplicacion y ha vuelto a instalar
    if (!localInterestPoints && firebaseInterestPoints.length > 0) {
      //Hacer una copia de firebaseInterestPoints pero sin incluir el id en cada InterestPoints
      const interestPointsWithoutId = firebaseInterestPoints.map(
        ({id, ...rest}) => rest,
      );
      //guardarlo en asyncstorage y en el state
      await AsyncStorage.setItem(
        'interestPoints',
        JSON.stringify(interestPointsWithoutId),
      );
      setInterestPoints(interestPointsWithoutId);
    }
    //Si no existe coleccion local pero si online es que el usuario ha borrado aplicacion y ha vuelto a instalar
    if (!localJourneys && firebaseJourneys.length > 0) {
      //Hacer una copia de firebaseInterestPoints pero sin incluir el id en cada InterestPoints
      const journeysWithoutId = firebaseJourneys.map(
        ({id, ...rest}) => rest,
      );
      //guardarlo en asyncstorage y en el state
      await AsyncStorage.setItem(
        'journeys',
        JSON.stringify(journeysWithoutId),
      );
      setJourneys(journeysWithoutId);
    }

    if (localUserInfo) {
      // Sincronizar Informacion de usuario
      if (
        localUserInfo.defaultRouteType !== firebaseUserInfo.defaultRouteType ||
        localUserInfo.defaultVehicle !==
          firebaseUserInfo.defaultVehicle
      ) {
        // Update Firebase con la información local
        const userDocRef = doc(db, 'production_users', firebaseUserInfo.id);
        const updatedUserInfo = {
          ...firebaseUserInfo,
          defaultRouteType: localUserInfo.defaultRouteType,
          defaultVehicle: localUserInfo.defaultVehicle,
        };

        updateDoc(userDocRef, updatedUserInfo)
          .then(() => {
            console.log('User info updated in Firebase successfully');
          })
          .catch(error => {
            console.error('Error updating user info in Firebase:', error);
          });
      }
    }

    if (localVehicles) {
      // Sincronizar Vehículos
      for (const localVehicle of localVehicles) {
        const firebaseVehicle = firebaseVehicles.find(
          v => v.plate === localVehicle.plate,
        );

        if (!firebaseVehicle) {
          // Añadir a Firebase si no existe
          const vehicleData = {...localVehicle};
          addDoc(collection(db, 'production_vehicles'), vehicleData);
        } else if (localVehicle.updatedAt > firebaseVehicle.updatedAt) {
          // Actualizar en Firebase si la versión local es más reciente
          const vehicleData = {...localVehicle};
          updateDoc(
            doc(db, 'production_vehicles', firebaseVehicle.id),
            vehicleData,
          );
        }
      }

      // Eliminar de Firebase los que no están localmente
      for (const firebaseVehicle of firebaseVehicles) {
        if (!localVehicles.some(v => v.plate === firebaseVehicle.plate)) {
          deleteDoc(doc(db, 'production_vehicles', firebaseVehicle.id));
        }
      }
    }
    if (localInterestPoints) {
      // Sincronizar Puntos de Interés (solo añadir o eliminar, sin actualizar)
      for (const localInterestPoint of localInterestPoints) {
        if (
          !firebaseInterestPoints.some(
            ip => ip.name === localInterestPoint.name,
          )
        ) {
          const interestPointData = {...localInterestPoint};
          addDoc(
            collection(db, 'production_interestPoints'),
            interestPointData,
          );
        }
      }

      for (const firebaseInterestPoint of firebaseInterestPoints) {
        if (
          !localInterestPoints.some(
            ip => ip.name === firebaseInterestPoint.name,
          )
        ) {
          deleteDoc(
            doc(db, 'production_interestPoints', firebaseInterestPoint.id),
          );
        }
      }
    }

    if (localJourneys) {
      // Sincronizar Puntos de Interés (solo añadir o eliminar, sin actualizar)
      for (const localJourney of localJourneys) {
        if (
          !firebaseJourneys.some(
            j => j.name === localJourney.name,
          )
        ) {
          const journeysData = {...localJourney};
          addDoc(
            collection(db, 'production_journeys'),
            journeysData,
          );
        }
      }

      for (const firebaseJourney of firebaseJourneys) {
        if (
          !localJourneys.some(
            j => j.name === firebaseJourney.name,
          )
        ) {
          deleteDoc(
            doc(db, 'production_journeys', firebaseJourney.id),
          );
        }
      }
    }
  };


  useEffect(() => {
    loadInitialData();
  }, []);

  const value = {
    user,
    setUser: userData => {
      setUser(userData);
    },
    vehicles,
    setVehicles: vehicleData => {
      setVehicles(vehicleData);
    },
    interestPoints,
    setInterestPoints: interestPointData => {
      setInterestPoints(interestPointData);
    },
    journeys,
    setJourneys: journeyData => {
      setJourneys(journeyData);
    },
    userInfo,
    setUserInfo: userInfo => {
      setUserInfo(userInfo);
    },
    loaded,
    syncData,
  };

  return (
    <AsyncStorageContext.Provider value={value}>
      {children}
    </AsyncStorageContext.Provider>
  );
};

export const useAsyncStorage = () => {
  return useContext(AsyncStorageContext);
};

export default AsyncStorageContext;
