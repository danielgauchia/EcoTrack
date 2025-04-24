import React, {useEffect} from 'react';
import {View, Text, Pressable, StyleSheet, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import globalStyles from '../styles';
import {useAsyncStorage} from '../contexts/AsyncStorageContext';
const Home = () => {
  const navigation = useNavigation();
  const {syncData, vehicles, interestPoints, userInfo, journeys} = useAsyncStorage();
  const handleNavigateToAddVehicle = () => {
    navigation.navigate('AddVehicle');
  };

  const handleNavigateToAddInterestPoint = () => {
    navigation.navigate('AddInterestPoint');
  };

  const handleNavigateToRouteFinder = () => {
    navigation.navigate('RouteFinder');
  };

  useEffect(() => {
    syncData(vehicles, interestPoints, userInfo, journeys)
  }, [])

  return (
    <ScrollView style={[globalStyles.primary, { flex: 1, padding: 20 }]}
      showsVerticalScrollIndicator={false}>
      <View>
        <Text style={globalStyles.mainText}>Welcome to EcoTrack</Text>

        <Pressable
          style={[styles.button, globalStyles.secondary]}
          onPress={handleNavigateToAddVehicle}>
          <Text style={styles.buttonText}>Add Vehicle</Text>
        </Pressable>

        <Pressable
          style={[styles.button, globalStyles.secondary]}
          onPress={handleNavigateToAddInterestPoint}>
          <Text style={styles.buttonText}>Add Interest Point</Text>
        </Pressable>

        <Pressable
          style={[styles.button, globalStyles.secondary]}
          onPress={handleNavigateToRouteFinder}>
          <Text style={styles.buttonText}>Find a Route</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({

  button: {
    backgroundColor: 'black',
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#3b3b3b',
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Home;
