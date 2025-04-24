import React, {useRef, useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BackHandler} from 'react-native';
import Home from '../views/Home';
import RoutesScreen from '../views/RoutesScreen';
import InterestPointsScreen from '../views/InterestPointsScreen';
import VehiclesScreen from '../views/VehiclesScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import globalStyles from '../styles';
const TabStack = () => {
  const Tab = createBottomTabNavigator();
  
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 15,
          fontWeight: 500,
        },
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'RoutesScreen') {
            iconName = focused ? 'routes' : 'routes';
          } else if (route.name === 'VehiclesScreen') {
            iconName = focused ? 'car' : 'car-outline';
          } else {
            iconName = focused ? 'map-marker' : 'map-marker-outline';
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveBackgroundColor: globalStyles.black.backgroundColor,
        tabBarInactiveBackgroundColor: globalStyles.black.backgroundColor,

        tabBarActiveTintColor: '#2f9f82',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          borderTopWidth: 0, // Remove the top border
        },
      })}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="RoutesScreen"
        component={RoutesScreen}
        options={{
          tabBarLabel: 'Routes',
        }}
      />
      <Tab.Screen
        name="VehiclesScreen"
        component={VehiclesScreen}
        options={{
          tabBarLabel: 'Vehicles',
        }}
      />
      <Tab.Screen
        name="InterestPointsScreen"
        component={InterestPointsScreen}
        options={{
          tabBarLabel: 'Int. Points',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabStack;
