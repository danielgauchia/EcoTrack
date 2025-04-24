import React, {useState, useEffect} from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Alert,
  Text,
  ScrollView,
  Modal,
} from 'react-native';
import {TextInput} from 'react-native-paper';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {useRouteController} from '../contexts/RouteControllerContext';
import {useVehicleController} from '../contexts/VehicleControllerContext';
import {useInterestPointController} from '../contexts/InterestPointControllerContext';
import {useAsyncStorage} from '../contexts/AsyncStorageContext';
import {Picker} from '@react-native-picker/picker';
import InterestPoint from '../models/InterestPoint';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Config from 'react-native-config';
import Vehicle from '../models/Vehicle';
import Route from '../models/Route';
import Journey from '../models/Journey';
import globalStyles from '../styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useRoute} from '@react-navigation/native';

const RouteFinder = () => {
  const route = useRoute();
  const vehiclesController = useVehicleController();
  const routeController = useRouteController();
  const interestPointController = useInterestPointController();
  const {vehicles, interestPoints, user, userInfo, journeys, setJourneys} =
    useAsyncStorage();
  const [localInterestPoints, setLocalInterestPoints] =
    useState(interestPoints);
  const [localVehicles, setLocalVehicles] = useState(vehicles);
  const [showMap, setShowMap] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [journey, setJourney] = useState(null);
  const [originName, setOriginName] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [journeyVehicleType, setJourneyVehicleType] = useState('');
  const [selectedRouteOption, setSelectedRouteOption] = useState('fast');
  const [selectedVehicleOption, setSelectedVehicleOption] = useState('generic');
  const [selectedOriginOption, setSelectedOriginOption] = useState('custom');
  const [selectedDestinationOption, setSelectedDestinationOption] =
    useState('custom');

  const [selectedGenericVehicleType, setSelectedGenericVehicleType] =
    useState('walking');

  const [selectedVehicle, setSelectedVehicle] = useState(
    localVehicles[0].plate,
  );
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const [useCustomVehicle, setUseCustomVehicle] = useState(false);
  const [useCustomOrigin, setuseCustomOrigin] = useState(false);
  const [useCustomDestiny, setuseCustomDestiny] = useState(false);

  useEffect(() => {
    if (route.params && route.params.journey) {
      const {journey} = route.params;
      // Establece los datos de la ruta en los estados correspondientes
      setJourney(journey);
      setName(journey.name);
      setRouteCoordinates(journey.coordinates);
      setDuration(formatDuration(journey.duration));
      setDistance(formatDistance(journey.distance));
      setPrice(journey.cost);
      setJourneyVehicleType(journey.vehicleType);
      // Agrega cualquier otro estado que necesites establecer
      setShowMap(true);
    }
  }, [route.params]);

  useEffect(() => {
    async function fetchInterestPoints() {
      const points = await interestPointController.getInterestPoints();
      setLocalInterestPoints(points);
      if (points.length > 0) {
        setSelectedOrigin(points[0].name);
        setSelectedDestination(points[0].name);
      }
    }
    fetchInterestPoints();
  }, [interestPoints]);

  useEffect(() => {
    async function fetchVehicles() {
      const vehicles = await vehiclesController.getVehicles();
      setLocalVehicles(vehicles);
      if (!userInfo) {
        if (vehicles.length > 0) {
          setSelectedVehicle(vehicles[0].plate);
        }
      } else {
        if (userInfo.defaultRouteType) {
          setSelectedRouteOption(userInfo.defaultRouteType);
        }
        if (userInfo.defaultVehicle) {
          if (
            ['walking', 'bike', 'diesel', 'electric', 'gasoline'].includes(
              userInfo.defaultVehicle,
            )
          ) {
            setSelectedGenericVehicleType(userInfo.defaultVehicle);
          } else {
            setSelectedVehicleOption('custom');
            setUseCustomVehicle(true);
            setSelectedVehicle(userInfo.defaultVehicle);
          }
        }
      }
    }

    fetchVehicles();
  }, [vehicles, userInfo]);

  const handleSaveRoute = () => {
    setModalVisible(true);
  };

  const handleConfirmSaveRoute = async () => {
    setModalVisible(false);
    const userEmail = user ? user.email : null;
    const j = new Journey(
      userEmail,
      journey.coordinates,
      journey.distance,
      journey.duration,
      price,
      name,
      journeyVehicleType,
    );

    try {
      await routeController.storeJourney(j);
      setJourneys(journeys ? [...journeys, j] : [j]);

      Alert.alert('Route succesfully added.');
    } catch (error) {
      let message = 'An error occurred. Please try again.';

      if (error.message.includes('too many index entries for entity')) {
        message = 'Cannot store a route this long.';
      } else {
        switch (error.code) {
          case 'InvalidNameException':
            message = 'Please enter a valid name.';
            break;
          case 'JourneyAlreadyStoredException':
            message = 'There is aleady a journey stored with this name.';
            break;
          default:
            console.log(error);
            break;
        }
      }
      Alert.alert('Addition Error', message);
    }
  };

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
      setJourney(journey);
      // Actualiza el estado para mostrar la ruta en el mapa
      setRouteCoordinates(journey.coordinates);
      setDuration(formatDuration(journey.duration));
      setDistance(formatDistance(journey.distance));
      setShowMap(true);

      const price = await routeController.getPrice(journey, route);

      setJourneyVehicleType(vehicle.type);
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
          message = 'No route available.';
          break;
        default:
          console.log(error);
          break;
      }
      Alert.alert('Error', message);
    }
  };

  return (
    <View style={[globalStyles.primary, {flex: 1, padding: 10}]}>
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
                position: 'fixed',
                bottom: 0,
                padding: 5,
                borderRadius: 15,
                backgroundColor: '#17766b',
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
            {price !== '' &&
              ((selectedGenericVehicleType !== 'walking' &&
                selectedGenericVehicleType !== 'bike' &&
                journeyVehicleType === '') ||
                (journeyVehicleType !== 'walking' &&
                  journeyVehicleType !== 'bike')) && (
                <>
                  <Text
                    style={[
                      styles.label,
                      {color: globalStyles.white.backgroundColor},
                    ]}>
                    Estimated fuel price: {price}€
                  </Text>
                  {!route.params && (
                    <Pressable onPress={() => handleSaveRoute()}>
                      <MaterialCommunityIcons
                        name={'content-save'}
                        size={30}
                        color={'#013437'}
                      />
                    </Pressable>
                  )}
                </>
              )}
            {(price !== '' &&
              (selectedGenericVehicleType === 'walking' ||
                selectedGenericVehicleType === 'bike') &&
              journeyVehicleType === '') ||
              ((journeyVehicleType === 'walking' ||
                journeyVehicleType === 'bike') && (
                <>
                  <Text
                    style={[
                      styles.label,
                      {color: globalStyles.white.backgroundColor},
                    ]}>
                    Estimated calories burnt: {price}
                  </Text>
                  {!route.params && (
                    <Pressable onPress={() => handleSaveRoute()}>
                      <MaterialCommunityIcons
                        name={'content-save'}
                        size={30}
                        color={'#013437'}
                      />
                    </Pressable>
                  )}
                </>
              ))}
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
          {vehicles && vehicles.length > 0 && (
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
                <View style={styles.pickerContainer2}>
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
                </View>
              ) : (
                <Text>No custom vehicles created yet</Text>
              )}
            </>
          ) : (
            <View style={styles.pickerContainer2}>
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
            </View>
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
            <View>
              <GooglePlacesAutocomplete
                placeholder="Toponym"
                fetchDetails={false}
                disableScroll={true}
                searchOptions={{types: ['(cities)']}}
                onPress={(details = null) => {
                  setOriginName(details.description);
                }}
                query={{
                  key: Config.GOOGLE_MAPS_API_KEY,
                  language: 'es',
                }}
                styles={{
                  textInputContainer: {
                    padding: 13,
                    marginBottom: 10,
                    ...globalStyles.white,
                    borderWidth: 1,
                    borderColor: 'black',
                  },
                  textInput: {
                    marginTop: 2,
                    marginLeft: 2,
                    fontSize: 16,
                    color: '#011a1b',
                  },
                  description: {
                    color: '#011a1b',
                  }
                }}
              />
            </View>
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
            <View>
              <GooglePlacesAutocomplete
                placeholder="Toponym"
                fetchDetails={false}
                disableScroll={true}
                searchOptions={{types: ['(cities)']}}
                onPress={(details = null) => {
                  // Formateamos los datos para enviar solamente el nombre de la ciudad (Sin el país)
                  setDestinationName(details.description);
                }}
                query={{
                  key: Config.GOOGLE_MAPS_API_KEY,
                  language: 'es',
                }}
                styles={{
                  textInputContainer: {
                    padding: 13,
                    marginBottom: 10,
                    ...globalStyles.white,
                    borderWidth: 1,
                    borderColor: 'black',
                  },
                  textInput: {
                    marginTop: 2,
                    marginLeft: 2,
                    fontSize: 16,
                    color: '#011a1b',
                  },
                  description: {
                    color: '#011a1b',
                  }
                }}
              />
            </View>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={{
                flexDirection: 'row',
                position: 'absolute',
                right: 10,
                top: 10
              }}>
              <Pressable
                onPress={() => setModalVisible(!modalVisible)}
                style={{marginLeft: 10}}>
                <MaterialCommunityIcons
                  name={'close'}
                  size={24}
                  color="white"
                />
              </Pressable>
            </View>
            <TextInput
              style={styles.modalText}
              placeholder="Route Name"
              onChangeText={text => setName(text)}
              defaultValue={name}
            />
            <View style={styles.flexContainer}>
              <Pressable
                style={[styles.button, styles.buttonSave]}
                onPress={handleConfirmSaveRoute}>
                <Text style={styles.textStyle}>Save Route</Text>
              </Pressable>
              {/* <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable> */}
            </View>
          </View>
        </View>
      </Modal>
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
  pickerContainer2: {
    borderWidth: 1,
    borderColor: '#5c6e61',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#003639',
    borderRadius: 20,
    padding: 35,
    height: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  buttonClose: {
    backgroundColor: '#17766b',
  },
  buttonSave: {
    backgroundColor: '#2f9f82',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    width: 250,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  flexContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default RouteFinder;
