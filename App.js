import 'react-native-gesture-handler';
import React, {useRef, useEffect} from 'react';
import { BackHandler , Image} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {PaperProvider, DefaultTheme} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import globalStyles from './styles';
import RNBootSplash from 'react-native-bootsplash';
import HeaderDropdown from './components/HeaderDropdown';
import logo from './assets/bootsplash_logo.png';
//Views
import Login from './views/Login';
import Register from './views/Register';
import AddVehicle from './views/AddVehicle';
import UpdateVehicle from './views/UpdateVehicle';
import AddInterestPoint from './views/AddInterestPoint';
import RouteFinder from './views/RouteFinder';
import TabStack from './stacks/TabStack';
//Contexts
import {UserControllerProvider} from './contexts/UserControllerContext';
import {VehicleControllerProvider} from './contexts/VehicleControllerContext';
import {InterestPointControllerProvider} from './contexts/InterestPointControllerContext';
import {RouteControllerProvider} from './contexts/RouteControllerContext';
import {useAsyncStorage} from './contexts/AsyncStorageContext';
import Preferences from './views/Preferences';

const App = () => {
  const Stack = createStackNavigator();
  const navigationRef = useRef(null);
  useEffect(() => {
    // Esto es para que no volvamos a login si pulsamos hacia atras en Home
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (
          navigationRef.current &&
          navigationRef.current.getCurrentRoute().name === 'Home'
        ) {
          return true;
        }
      },
    );

    return () => backHandler.remove();
  }, []);
  const {user, loaded} = useAsyncStorage();

  useEffect(() => {
    if (loaded) {
      RNBootSplash.hide({fade: true, duration: 500});
    }
  }, [loaded]);

  const theme = {
    ...DefaultTheme, // Usa el DefaultTheme como base
    colors: {
      ...DefaultTheme.colors,
      primary: '#2f9f82',
      accent: '#013437',
      text: '#000000',
      placeholder: 'black',
    },
  };

  useEffect(() => {
    if (user) {
      // Si hay un usuario, redirige a Home
      navigationRef.current?.navigate('TabBar', { screen: 'Home' });

    }
  }, [user]);

  return (
    <PaperProvider theme={theme}>
      <RouteControllerProvider>
        <InterestPointControllerProvider>
          <VehicleControllerProvider>
            <UserControllerProvider>
              <NavigationContainer ref={navigationRef}>
                <Stack.Navigator
                  screenOptions={{
                    headerStyle: {...globalStyles.black},
                    headerTintColor: globalStyles.white.backgroundColor,
                    animationEnabled: false, // Deshabilita la animación de transición
                    headerShown: true,

                  }}>
                  <Stack.Screen
                    name="Login"
                    component={Login}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="Register"
                    component={Register}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="TabBar"
                    component={TabStack}
                    options={{
                      title: 'EcoTrack',
                      headerLeft: () => (
                        <Image
                          source={logo}
                          style={{ width: 100, height: 100}} // Ajusta el tamaño y el margen según tus necesidades
                        />
                      ),
                      headerRight: () => <HeaderDropdown />,
                    }}
                  />

                  <Stack.Screen
                    name="AddVehicle"
                    component={AddVehicle}
                    options={{headerShown: true, title:'New Vehicle', headerRight: () => <HeaderDropdown/>}}
                  />
                  <Stack.Screen
                    name="UpdateVehicle"
                    component={UpdateVehicle}
                    options={{headerShown: true, title:'Modify Vehicle', headerRight: () => <HeaderDropdown/>}}
                  />
                  <Stack.Screen
                    name="AddInterestPoint"
                    component={AddInterestPoint}
                    options={{headerShown: true, title:'New Interest Point', headerRight: () => <HeaderDropdown/>}}
                  />
                  <Stack.Screen
                    name="Preferences"
                    component={Preferences}
                    options={{headerShown: true, title:'Preferences', headerRight: () => <HeaderDropdown/>}}
                  />
                  <Stack.Screen
                    name="RouteFinder"
                    component={RouteFinder}
                    options={{headerShown: true, title:'Search Route', headerRight: () => <HeaderDropdown/>}}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </UserControllerProvider>
          </VehicleControllerProvider>
        </InterestPointControllerProvider>
      </RouteControllerProvider>
    </PaperProvider>
  );
};

export default App;
