import React from 'react';
import {View, Text, Pressable, StyleSheet, FlatList} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAsyncStorage} from '../contexts/AsyncStorageContext';
import globalStyles from '../styles';

const InterestPointsScreen = () => {
  const navigation = useNavigation();
  const {interestPoints} = useAsyncStorage();
  const handleNavigateToAddInterestPoint = () => {
    navigation.navigate('AddInterestPoint');
  };
  const renderInterestPoints = ({item}) => <InterestPointCard ip={item} />;

  const InterestPointCard = ({ip}) => (
    <View style={styles.card}>
      <Text style={styles.name}>{ip.name}</Text>
      <Text style={styles.details}>Longitude: {ip.longitude}</Text>
      <Text style={styles.details}>Latitude: {ip.latitude}</Text>
    </View>
  );

  return (
    <View style={[globalStyles.primary, {flex: 1, padding: 20}]}>
      <FlatList
        data={interestPoints}
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
  },
  details: {
    fontSize: 16,
  },
});

export default InterestPointsScreen;
