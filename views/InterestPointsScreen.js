import React, {useEffect, useState} from 'react';
import {View, Text, Pressable, StyleSheet, FlatList, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAsyncStorage} from '../contexts/AsyncStorageContext';
import {useInterestPointController} from '../contexts/InterestPointControllerContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import globalStyles from '../styles';
const InterestPointsScreen = () => {
  const navigation = useNavigation();
  const {interestPoints, setInterestPoints} = useAsyncStorage();
  const [localInterestPoints, setLocalInterestPoints] = useState(
    interestPoints ? interestPoints : [],
  );
  const interestPointController = useInterestPointController();
  const handleNavigateToAddInterestPoint = () => {
    navigation.navigate('AddInterestPoint');
  };

  const handleDeleteInterestPoint = async interestPoint => {
    Alert.alert(
      'DELETE INTEREST POINT',
      'Do you want to delete this interest point?',
      [
        {
          text: 'OK',
          onPress: async () => {
            try {
              await interestPointController.removeInterestPoint(interestPoint);
              // Filtrar la lista para eliminar el punto de interés
              const updatedInterestPoints = interestPoints.filter(
                ip => ip.name !== interestPoint.name,
              );
              // Guardar la lista actualizada
              setInterestPoints(updatedInterestPoints);
              Alert.alert('Interest point succesfully deleted.');
            } catch (error) {
              let message = 'An error occurred. Please try again.';
              switch (error.code) {
                case 'InterestPointNotFoundException':
                  message = "Interest Point doesn't exist.";
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
      ],
    );
  };

  const handleFavoriteInterestPoint = async interestPoint => {
    try {
      await interestPointController.favoriteInterestPoint(interestPoint);
      // Actualizar el estado local para reflejar el cambio
      const updatedInterestPoints = localInterestPoints.map(ip =>
        ip.name === interestPoint.name && ip.creator === interestPoint.creator
          ? {...ip, isFavorite: !ip.isFavorite}
          : ip,
      );
      setLocalInterestPoints(updatedInterestPoints);
      setInterestPoints(updatedInterestPoints);
    } catch (error) {
      Alert.alert(
        'Error',
        'An error occurred while updating the favorite status.',
      );
    }
  };

  useEffect(() => {
    async function fetchInterestPoints() {
      const points = await interestPointController.getInterestPoints();
      setLocalInterestPoints(points);
    }
    fetchInterestPoints();
  }, [interestPoints]);

  const renderInterestPoints = ({item}) => <InterestPointCard ip={item} />;

  const InterestPointCard = ({ip}) => (
    <View
      style={[
        styles.card,
      ]}>
      <View style={{flex: 1}}>
        <Text style={styles.name}>{ip.name}</Text>
        <Text style={styles.details}>Longitude: {ip.longitude}</Text>
        <Text style={styles.details}>Latitude: {ip.latitude}</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          
        }}>
        <Pressable onPress={() => handleFavoriteInterestPoint(ip)}>
          <MaterialCommunityIcons
            name={ip.isFavorite ? 'star' : 'star-outline'}
            size={30}
            color={ip.isFavorite ? 'gold' : 'grey'}
          />
        </Pressable>
        <Pressable onPress={() => handleDeleteInterestPoint(ip)}>
          <MaterialCommunityIcons
            name={'trash-can'}
            size={30}
            color="#8f0916"
            style={{marginLeft: 10}}
          />
        </Pressable>
      </View>
    </View>
  );
  return (
    <View style={[globalStyles.primary, {flex: 1, padding: 20}]}>
      <FlatList
        data={localInterestPoints}
        keyExtractor={item => item.name}
        renderItem={renderInterestPoints}
        ListFooterComponent={
          <Pressable
            style={[styles.button, globalStyles.secondary]}
            onPress={handleNavigateToAddInterestPoint}>
            <Text style={styles.buttonText}>NEW INTEREST POINT</Text>
          </Pressable>
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

export default InterestPointsScreen;
