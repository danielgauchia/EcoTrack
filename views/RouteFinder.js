import React, {useState, useEffect} from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Alert,
  Text,
  ScrollView,
} from 'react-native';
import {TextInput} from 'react-native-paper';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {useRouteController} from '../contexts/RouteControllerContext';
import {useVehicleController} from '../contexts/VehicleControllerContext';
import {useInterestPointController} from '../contexts/InterestPointControllerContext';
import {useAsyncStorage} from '../contexts/AsyncStorageContext';
import {Picker} from '@react-native-picker/picker';
import InterestPoint from '../models/InterestPoint';
import Vehicle from '../models/Vehicle';
import Route from '../models/Route';
import globalStyles from '../styles';
const RouteFinder = () => {
  const vehiclesController = useVehicleController();
  const routeController = useRouteController();
  const interestPointController = useInterestPointController();
  const {vehicles, interestPoints, user} = useAsyncStorage();
  const [localInterestPoints, setLocalInterestPoints] =
    useState(interestPoints);
  const [localVehicles, setLocalVehicles] = useState(vehicles);
  const [showMap, setShowMap] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [price, setPrice] = useState('');

  const [originName, setOriginName] = useState('');
  const [destinationName, setDestinationName] = useState('');

  const [selectedRouteOption, setSelectedRouteOption] = useState('fast');
  const [selectedVehicleOption, setSelectedVehicleOption] = useState('generic');
  const [selectedOriginOption, setSelectedOriginOption] = useState('custom');
  const [selectedDestinationOption, setSelectedDestinationOption] =
    useState('custom');

  const [selectedGenericVehicleType, setSelectedGenericVehicleType] =
    useState('walking');

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const [useCustomVehicle, setUseCustomVehicle] = useState(false);
  const [useCustomOrigin, setuseCustomOrigin] = useState(false);
  const [useCustomDestiny, setuseCustomDestiny] = useState(false);

  useEffect(() => {
    async function fetchInterestPoints() {
      const points = await interestPointController.getInterestPoints();
      setLocalInterestPoints(points);
      setSelectedOrigin(points[0].name);
      setSelectedDestination(points[0].name);
    }
    fetchInterestPoints();
  }, [interestPoints]);

  useEffect(() => {
    async function fetchVehicles() {
      const vehicles = await vehiclesController.getVehicles();
      setLocalVehicles(vehicles);
      setSelectedVehicle(vehicles[0].plate);
    }

    fetchVehicles();
  }, [vehicles]);

  const formatDuration = seconds => {
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString()}h ${minutes.toString()}min ${secs.toString()}s`;
  };

  const formatDistance = meters => {
    const kilometers = meters / 1000;

    return `${kilometers.toFixed(2)} km`;
  };

  const findRoute = async () => {
    try {
      // Decide si usar puntos de interés personalizados o toponímicos
      const origin = useCustomOrigin
        ? interestPoints.find(ip => ip.name === selectedOrigin)
        : new InterestPoint(user.email, originName);
      const destination = useCustomDestiny
        ? interestPoints.find(ip => ip.name === selectedDestination)
        : new InterestPoint(user.email, destinationName);
      // Decide si usar vehículo personalizado o genérico
      const vehicle = useCustomVehicle
        ? vehicles.find(v => v.plate === selectedVehicle)
        : new Vehicle(
            user.email,
            'Generic',
            'Generic',
            2020,
            0,
            'GENERIC',
            selectedGenericVehicleType,
          );

      // Crea un objeto Route
      const route = new Route(
        user.email,
        origin,
        destination,
        vehicle,
        selectedRouteOption,
      );

      // Obtiene la ruta del RouteController
      const journey = await routeController.getRoute(route);

      // Actualiza el estado para mostrar la ruta en el mapa
      setRouteCoordinates(journey.coordinates);
      setDuration(formatDuration(journey.duration));
      setDistance(formatDistance(journey.distance));
      setShowMap(true);
      const price = await routeController.getPrice(journey, route);
      setPrice(price);
    } catch (error) {
      let message = 'An error occurred. Please try again.';
      switch (error.code) {
        case 'NoInetConection':
          message = 'You need internet to get routes.';
          break;
        case 'InvalidInterestPointException':
          message = 'There is an invalid interest point.';
          break;
        case 'RouteNotAvailableException':
          message = `There wansn't a route found.`;
          break;
        default:
          console.log(error);
          break;
      }
      Alert.alert('Error', message);
    }
  };

  return (
    <View style={[globalStyles.primary, {flex: 1, padding: 20}]}>
      {showMap ? (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: routeCoordinates[0]?.latitude,
              longitude: routeCoordinates[0]?.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            <Marker coordinate={routeCoordinates[0]} />
            <Marker
              coordinate={routeCoordinates[routeCoordinates.length - 1]}
            />
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#000"
              strokeWidth={3}
            />
          </MapView>
          <View
            style={[
              globalStyles.black,
              {
                position: 'absolute',
                bottom: 0,
                width: '100%',
                alignItems: 'center',
              },
            ]}>
            <Text
              style={[
                styles.label,
                {color: globalStyles.white.backgroundColor},
              ]}>
              Duration: {duration}
            </Text>
            <Text
              style={[
                styles.label,
                {color: globalStyles.white.backgroundColor},
              ]}>
              Distance: {distance}
            </Text>
            {price !== '' && selectedGenericVehicleType !== 'walking' && selectedGenericVehicleType !== 'bike' && (
              <Text
                style={[
                  styles.label,
                  {color: globalStyles.white.backgroundColor},
                ]}>
                Estimated fuel price: {price}€
              </Text>
            )}
            {(price !== '' && (selectedGenericVehicleType == 'walking' || selectedGenericVehicleType == 'bike')) && (
              <Text
                style={[
                  styles.label,
                  {color: globalStyles.white.backgroundColor},
                ]}>
                Estimated calories burnt: {price}
              </Text>
            )}
          </View>
        </>
      ) : (
        <ScrollView
          style={[globalStyles.primary, {flex: 1, padding: 20}]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Route Type</Text>
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

          <Text style={styles.label}>Vehicle</Text>
          {vehicles && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedVehicleOption}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectedVehicleOption(itemValue);
                  setUseCustomVehicle(itemValue === 'custom');
                }}>
                <Picker.Item label="Own" value="custom" />
                <Picker.Item label="Generic" value="generic" />
              </Picker>
            </View>
          )}

          {selectedVehicleOption === 'custom' ? (
            <>
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
            </>
          ) : (
            <Picker
              selectedValue={selectedGenericVehicleType}
              onValueChange={(itemValue, itemIndex) => {
                setSelectedGenericVehicleType(itemValue);
              }}>
              <Picker.Item label="Walk" value="walking" />
              <Picker.Item label="Bycicle" value="bike" />
              <Picker.Item label="Diesel car" value="diesel" />
              <Picker.Item label="Electric car" value="electric" />
              <Picker.Item label="Gasoline car" value="gasoline" />
            </Picker>
          )}
          <Text style={styles.label}>Origin</Text>
          {localInterestPoints && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedOriginOption}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectedOriginOption(itemValue);
                  setuseCustomOrigin(itemValue !== 'custom');
                }}>
                <Picker.Item label="Toponymic" value="custom" />
                <Picker.Item label="Own" value="own" />
              </Picker>
            </View>
          )}

          {selectedOriginOption === 'custom' ? (
            <TextInput
              cursorColor="black"
              mode="flat"
              label="Origin Toponym"
              style={styles.input}
              value={originName}
              onChangeText={text => setOriginName(text)}
            />
          ) : (
            <>
              {localInterestPoints && localInterestPoints.length > 0 ? (
                <Picker
                  selectedValue={selectedOrigin}
                  onValueChange={(itemValue, itemIndex) => {
                    setSelectedOrigin(itemValue);
                  }}>
                  {localInterestPoints.map(ip => (
                    <Picker.Item
                      key={ip.name}
                      label={ip.name}
                      value={ip.name}
                    />
                  ))}
                </Picker>
              ) : (
                <Text>No custom interest points created yet</Text>
              )}
            </>
          )}
          <Text style={styles.label}>Destination</Text>
          {localInterestPoints && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedDestinationOption}
                onValueChange={(itemValue, itemIndex) => {
                  setSelectedDestinationOption(itemValue);
                  setuseCustomDestiny(itemValue !== 'custom');
                }}>
                <Picker.Item label="Toponymic" value="custom" />
                <Picker.Item label="Own" value="own" />
              </Picker>
            </View>
          )}

          {selectedDestinationOption === 'custom' ? (
            <TextInput
              cursorColor="black"
              mode="flat"
              label="Destination Toponym"
              style={styles.input}
              value={destinationName}
              onChangeText={text => setDestinationName(text)}
            />
          ) : (
            <>
              {localInterestPoints && localInterestPoints.length > 0 ? (
                <Picker
                  selectedValue={selectedDestination}
                  onValueChange={(itemValue, itemIndex) => {
                    setSelectedDestination(itemValue);
                  }}>
                  {localInterestPoints.map(ip => (
                    <Picker.Item
                      key={ip.name}
                      label={ip.name}
                      value={ip.name}
                    />
                  ))}
                </Picker>
              ) : (
                <Text>No custom interest points created yet</Text>
              )}
            </>
          )}
          <Pressable
            style={[
              styles.button,
              globalStyles.secondary,
              {marginTop: 0, marginBottom: 30},
            ]}
            onPress={findRoute}>
            <Text style={styles.buttonText}>Find Route</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
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
    fontWeight: 'bold',
  },
});

export default RouteFinder;
