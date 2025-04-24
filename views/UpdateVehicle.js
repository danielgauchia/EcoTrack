import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import {TextInput} from 'react-native-paper';
import globalStyles from '../styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useVehicleController} from '../contexts/VehicleControllerContext';
import {useAsyncStorage} from '../contexts/AsyncStorageContext';
import Vehicle from '../models/Vehicle';
import {Picker} from '@react-native-picker/picker';

const UpdateVehicle = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const vehicleController = useVehicleController();
  const {vehicleToEdit} = route.params;

  const [brand, setBrand] = useState(vehicleToEdit.brand);
  const [model, setModel] = useState(vehicleToEdit.model);
  const [year, setYear] = useState(vehicleToEdit.year.toString());
  const [averageConsumption, setAverageConsumption] = useState(
    vehicleToEdit.averageConsumption.toString(),
  );
  const [type, setType] = useState(vehicleToEdit.type);

  const {setVehicles, vehicles} = useAsyncStorage(); // Obtener el usuario del contexto de AsyncStorage

  const handleUpdateVehicle = async () => {
    if (
      brand === '' ||
      model === '' ||
      year === '' ||
      averageConsumption === ''
    ) {
      Alert.alert('Please fill in all parameters.');
    } else {
      try {
        const newVehicle = new Vehicle(
          vehicleToEdit.creator,
          brand,
          model,
          parseInt(year),
          parseFloat(averageConsumption),
          vehicleToEdit.plate,
          type,
        );

        const vehicleToUpdate = {
          ...newVehicle,
          isFavorite: vehicleToEdit.isFavorite,
        };

        await vehicleController.updateVehicle(vehicleToUpdate);

        // Actualizar el arreglo de vehículos reemplazando el vehículo editado
        const updatedVehicles = vehicles.map(v =>
          v.plate === vehicleToEdit.plate ? vehicleToUpdate : v,
        );

        setVehicles(updatedVehicles);

        Alert.alert(
          'Vehicle Updated',
          'Your vehicle has been successfully updated.',
        );
        // Navegar a otra pantalla o actualizar la vista si es necesario
        navigation.navigate('VehiclesScreen');
      } catch (error) {
        let errorMessage = 'Failed to update vehicle.';
        if (
          error instanceof Error &&
          error.message === 'YearNotValidException'
        ) {
          errorMessage = 'The year of the vehicle is not valid.';
        }
        Alert.alert('Error', errorMessage);
      }
    }
  };

  return (
    <ScrollView
      style={[globalStyles.primary, {flex: 1, padding: 20}]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View>
        <Text style={globalStyles.mainText}>{vehicleToEdit.plate}</Text>

        <TextInput
          cursorColor="black"
          mode="flat"
          label="Brand"
          style={styles.input}
          value={brand}
          onChangeText={text => setBrand(text)}
        />

        <TextInput
          cursorColor="black"
          mode="flat"
          label="Model"
          style={styles.input}
          value={model}
          onChangeText={text => setModel(text)}
        />

        <TextInput
          cursorColor="black"
          mode="flat"
          label="Year"
          style={styles.input}
          value={year}
          onChangeText={text => setYear(text)}
          keyboardType="numeric"
        />

        <TextInput
          cursorColor="black"
          mode="flat"
          label="Avg. Consumption"
          style={styles.input}
          value={averageConsumption}
          onChangeText={text => {
            // Replace commas with points in the input
            const formattedText = text.replace(',', '.');
            setAverageConsumption(formattedText);
          }}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Vehicle Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={type}
            onValueChange={(itemValue, itemIndex) => setType(itemValue)}>
            <Picker.Item label="Electric" value="electric" />
            <Picker.Item label="Gasoline" value="gasoline" />
            <Picker.Item label="Diesel" value="diesel" />
          </Picker>
        </View>
        <Pressable
          style={[
            styles.button,
            globalStyles.secondary,
            {marginTop: 0, marginBottom: 30},
          ]}
          onPress={handleUpdateVehicle}>
          <Text style={styles.buttonText}>UPDATE VEHICLE</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    padding: 10,
    marginBottom: 10,
    ...globalStyles.white,
    borderWidth: 1,
    borderColor: 'black',
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
  },
});
export default UpdateVehicle;
