import React, {useState, useEffect} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAsyncStorage} from '../contexts/AsyncStorageContext';
import {useInterestPointController} from '../contexts/InterestPointControllerContext';
import InterestPoint from '../models/InterestPoint';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Config from 'react-native-config';
import NetInfo from '@react-native-community/netinfo';
const AddInterestPoint = () => {
  const navigation = useNavigation();
  const [showCoordinateInput, setCoordinateInput] = useState(false);
  const [showToponymInput, setToponymInput] = useState(true);
  const interestPointController = useInterestPointController();
  const {user, interestPoints, setInterestPoints} = useAsyncStorage(); // Obtener el usuario del contexto de AsyncStorage

  const [name, setName] = useState('');
  const [toponym, setToponym] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const checkConnectivity = async () => {
      const netInfo = await NetInfo.fetch();
      setConnected(netInfo.isConnected);
    };

    checkConnectivity();
  }, []);

  const handleAddInterestPointByCoordinates = async () => {
    if (name === '' || latitude === '' || longitude === '') {
      Alert.alert('Please fill in all the parameters');
    } else {
      try {
        const userEmail = user ? user.email : null;
        if (!userEmail) {
          Alert.alert('Error', 'User information not found.');
          return;
        }

        const newInterestPoint = new InterestPoint(
          userEmail,
          name,
          parseFloat(latitude),
          parseFloat(longitude),
        );

        const point = await interestPointController.registerInterestPoint(
          newInterestPoint,
        );
        setInterestPoints(
          interestPoints ? [...interestPoints, point] : [point],
        );
        Alert.alert(
          'Interest Point Added',
          'Your interest point has been successfully added.',
        );
        // Navegar a otra pantalla o actualizar la vista si es necesario
        navigation.navigate('Home');
      } catch (error) {
        let errorMessage = 'Failed to add interest point.';
        if (
          error instanceof Error &&
          error.message === 'InvalidCoordinatesException'
        ) {
          errorMessage = 'The coordinates of the interest point are not valid.';
        } else if (error.code === 'DuplicateInterestPointException') {
          errorMessage =
            'You already have an interest point with that name registered';
        }
        Alert.alert('Error', errorMessage);
        console.log(error);
      }
    }
  };

  const handleAddInterestPointByToponym = async () => {
    if (toponym === '') {
      Alert.alert('Please input a valid toponym');
    } else {
      try {
        const userEmail = user ? user.email : null;
        if (!userEmail) {
          Alert.alert('Error', 'User information not found.');
          return;
        }

        const newInterestPoint = new InterestPoint(userEmail, toponym);

        const point =
          await interestPointController.registerInterestPointToponym(
            newInterestPoint,
          );
        setInterestPoints(
          interestPoints ? [...interestPoints, point] : [point],
        );
        Alert.alert(
          'Interest Point Added',
          'Your interest point has been successfully added.',
        );
        // Navegar a otra pantalla o actualizar la vista si es necesario
        navigation.navigate('Home');
      } catch (error) {
        let errorMessage = 'Failed to add interest point.';
        if (error.code === 'DuplicateInterestPointException') {
          errorMessage =
            'You already have an interest point with that name registered';
        }
        Alert.alert('Error', errorMessage);
        console.log(error);
      }
    }
  };

  const swapCoordinateView = async () => {
    setCoordinateInput(true);
    setToponymInput(false);
  };

  const swapToponymView = async () => {
    setCoordinateInput(false);
    setToponymInput(true);
  };

  return (
    <ScrollView
      style={[globalStyles.primary, {flex: 1, padding: 20}]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View>
        {connected && (
          <View style={styles.container}>
            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  showToponymInput ? styles.selectedButton : styles.buttonTab,
                  {marginTop: 0, marginBottom: 30},
                ]}
                onPress={swapToponymView}>
                <Text style={styles.buttonText}>TOPONYM</Text>
              </Pressable>
            </View>
            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  showCoordinateInput
                    ? styles.selectedButton
                    : styles.buttonTab,
                  {marginTop: 0, marginBottom: 30},
                ]}
                onPress={swapCoordinateView}>
                <Text style={styles.buttonText}>COORDINATES</Text>
              </Pressable>
            </View>
          </View>
        )}

        {showCoordinateInput && (
          <View>
            <TextInput
              cursorColor="black"
              mode="flat"
              label="Name"
              style={styles.input}
              value={name}
              onChangeText={text => setName(text)}
            />

            <TextInput
              cursorColor="black"
              mode="flat"
              label="Latitude"
              style={styles.input}
              value={latitude}
              onChangeText={text => {
                // Replace commas with points in the input
                const formattedText = text.replace(',', '.');
                setLatitude(formattedText);
              }}
              keyboardType="numeric"
            />

            <TextInput
              cursorColor="black"
              mode="flat"
              label="Longitude"
              style={styles.input}
              value={longitude}
              onChangeText={text => {
                // Replace commas with points in the input
                const formattedText = text.replace(',', '.');
                setLongitude(formattedText);
              }}
              keyboardType="numeric"
            />

            <Pressable
              style={[
                styles.button,
                globalStyles.secondary,
                {marginTop: 0, marginBottom: 30},
              ]}
              onPress={handleAddInterestPointByCoordinates}>
              <Text style={styles.buttonText}>CREATE INTEREST POINT</Text>
            </Pressable>
          </View>
        )}

        {showToponymInput && (
          <View>
            <View>
              <GooglePlacesAutocomplete
                placeholder="Toponym"
                fetchDetails={false}
                disableScroll={true}
                searchOptions={{types: ['(cities)']}}
                onPress={(details = null) => {

                  setToponym(details.description);
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
                  },
                  
                }}
              />
            </View>

            <Pressable
              style={[
                styles.button,
                globalStyles.secondary,
                {marginTop: 0, marginBottom: 30},
              ]}
              onPress={handleAddInterestPointByToponym}>
              <Text style={styles.buttonText}>CREATE INTEREST POINT</Text>
            </Pressable>
          </View>
        )}
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
  buttonTab: {
    backgroundColor: '#013437',
    borderRadius: 0,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2f9f82',
    borderRadius: 0,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedButton: {
    backgroundColor: '#025357',
    borderRadius: 0,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2f9f82',
    borderRadius: 0,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 1,
  },
});

export default AddInterestPoint;
