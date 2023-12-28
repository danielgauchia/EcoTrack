import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, StyleSheet, ScrollView, Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useNavigation} from '@react-navigation/native';
import {useAsyncStorage} from '../contexts/AsyncStorageContext';
import globalStyles from '../styles';
import { useUserController } from '../contexts/UserControllerContext';
import { useVehicleController } from '../contexts/VehicleControllerContext';

const Preferences = () => {
    const navigation = useNavigation();
    const userController = useUserController();
    const vehiclesController = useVehicleController();
    const [selectedRouteOption, setSelectedRouteOption] = useState('fast');
    const {vehicles, user} = useAsyncStorage();
    const [localVehicles, setLocalVehicles] = useState(vehicles);
    const [selectedVehicleOption, setSelectedVehicleOption] = useState('generic');
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    useEffect(() => {
        async function fetchVehicles() {
          const vehicles = await vehiclesController.getVehicles();
          setLocalVehicles(vehicles);
          setSelectedVehicle(vehicles[0].plate);
        }
    
        fetchVehicles();
      }, [vehicles]);

    const savePreferences = async () => {
        // console.log(selectedRouteOption);
        // console.log(selectedVehicle);
        await userController.setDefaultRouteType(user.email, selectedRouteOption);
        await userController.setDefaultVehicle(selectedVehicle);

        Alert.alert(
            'Preferences changed.'
          );
          // Navegar a otra pantalla o actualizar la vista si es necesario
          navigation.navigate('Home');
    }

    return (
        <ScrollView
          style={[globalStyles.primary, {flex: 1, padding: 20}]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
            <Text style={globalStyles.mainText}>Preferences</Text>

            <View style={[
              {
                marginTop: 20,
              }
            ]}>
                <Text style={styles.label}>Default route type:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedRouteOption}
                        onValueChange={itemValue => {
                            setSelectedRouteOption(itemValue);
                        }}>
                        <Picker.Item label="Fast" value="fast" />
                        <Picker.Item label="Economic" value="economic" />
                    </Picker>
                </View>
            </View>
            
            <View style={[
              {
                marginTop: 20,
              },
            ]}>
                <Text style={styles.label}>Default vehicle</Text>
                <View style={styles.pickerContainer}>
                    {localVehicles && localVehicles.length > 0 ? (
                        <Picker
                            selectedValue={selectedVehicle}
                            onValueChange={(itemValue, itemIndex) => {
                            setSelectedVehicle(itemValue);
                            }}>
                            {localVehicles.map(v => (
                            <Picker.Item
                                key={v.plate}
                                label={`${v.plate} | ${v.brand} | ${v.model}`}
                                value={v.plate}
                            />
                            ))}
                        </Picker>
                    ) : (
                    <Text>No custom vehicles created yet</Text>
                    )}
                </View>
            </View>

            <View style={[
              {
                marginTop: 30,
              }
            ]}>
                <Pressable
                    style={[
                    styles.button,
                    globalStyles.secondary,
                    {marginTop: 0, marginBottom: 30},
                    ]}
                    onPress={savePreferences}>
                    <Text style={styles.buttonText}>Save</Text>
                </Pressable>
          </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    mainText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
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
    pickerContainer: {
      borderWidth: 1,
      borderColor: 'black',
      marginBottom: 10,
    },
    label: {
      fontSize: 16,
      color: 'black',
      marginBottom: 5,
      fontWeight: 'bold',
    },
  });

export default Preferences;