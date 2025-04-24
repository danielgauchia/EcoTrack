import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, StyleSheet, FlatList, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAsyncStorage} from '../contexts/AsyncStorageContext';
import globalStyles from '../styles';
import {useRouteController} from '../contexts/RouteControllerContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const RoutesScreen = () => {
  const navigation = useNavigation();
  const {journeys, setJourneys} = useAsyncStorage();
  const [localJourneys, setLocalJourneys] = useState(journeys ? journeys : []);
  const routeController = useRouteController();

  const handleDeleteRoute = async route => {
    Alert.alert('DELETE ROUTE', 'Do you want to delete this route?', [
      {
        text: 'OK',
        onPress: async () => {
          try {
            await routeController.removeRoute(route);
            // Filtrar la lista para eliminar el punto de interés
            const updatedJourneys = journeys.filter(j => j.name !== route.name);
            // Guardar la lista actualizada
            setJourneys(updatedJourneys);
            Alert.alert('Route succesfully deleted.');
          } catch (error) {
            let message = 'An error occurred. Please try again.';
            switch (error.code) {
              case 'JourneyNotFoundException':
                message = "That route doesn't exist.";
                break;
              default:
                console.log(error);
                break;
            }
            Alert.alert('Deletion Error', message);
          }
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const handleFavoriteRoute = async route => {
    try {
      await routeController.favoriteRoute(route);
      // Actualizar el estado local para reflejar el cambio
      const updatedJourneys = localJourneys.map(j =>
        j.name === route.name && j.creator === route.creator
          ? {...j, isFavorite: !j.isFavorite}
          : j,
      );
      setLocalJourneys(updatedJourneys);
      setJourneys(updatedJourneys);
    } catch (error) {
      Alert.alert(
        'Error',
        'An error occurred while updating the favorite status.',
      );
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

  useEffect(() => {
    async function fetchRoutes() {
      const routes = await routeController.getRoutes();
      setLocalJourneys(routes);
    }
    fetchRoutes();
  }, [journeys]);

  const handleNavigateToRouteFinder = () => {
    navigation.navigate('RouteFinder');
  };

  const handleNavigateToPreferences = () => {
    navigation.navigate('Preferences');
  };
  const renderJourneys = ({item}) => <JourneyCard j={item} />;

  const JourneyCard = ({j}) => (
    <Pressable onPress={() => navigation.navigate('RouteFinder', {journey: j})}>
      <View
        style={[
          styles.card,
          {
            flexDirection: 'column',
          },
        ]}>
        <View style={{flex: 1}}>
          <Text style={styles.name}>{j.name}</Text>
          <Text style={styles.details}>Duration: {formatDuration(j.duration)}</Text>
          <Text style={styles.details}>Cost: {j.cost}</Text>
          <Text style={styles.details}>Distance: {formatDistance(j.distance)}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            

          }}>
          <Pressable onPress={() => handleFavoriteRoute(j)}>
            <MaterialCommunityIcons
              name={j.isFavorite ? 'star' : 'star-outline'}
              size={30}
              color={j.isFavorite ? 'gold' : 'grey'}
            />
          </Pressable>
          <Pressable onPress={() => handleDeleteRoute(j)}>
            <MaterialCommunityIcons
              name={'trash-can'}
              size={30}
              color="#8f0916"
              style={{marginLeft: 10}}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
  return (
    <View style={[globalStyles.primary, {flex: 1, padding: 20}]}>
      <FlatList
        data={localJourneys}
        keyExtractor={item => item.name}
        renderItem={renderJourneys}
        ListFooterComponent={
          <View>
            <Pressable
              style={[styles.button, globalStyles.secondary]}
              onPress={handleNavigateToRouteFinder}>
              <Text style={styles.buttonText}>Find a Route</Text>
            </Pressable>
            <Pressable
              style={[styles.button, globalStyles.secondary]}
              onPress={handleNavigateToPreferences}>
              <Text style={styles.buttonText}>Route Preferences</Text>
            </Pressable>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    flex: 1,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'black',
  },
  details: {
    fontSize: 16,
    color: 'black',
  },
});

export default RoutesScreen;
