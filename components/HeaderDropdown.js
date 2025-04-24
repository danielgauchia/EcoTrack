import React, {useState} from 'react';
import {StyleSheet, View, Text, Alert} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useUserController} from '../contexts/UserControllerContext';
import {useNavigation} from '@react-navigation/native';
import globalStyles from '../styles';
import {useAsyncStorage} from '../contexts/AsyncStorageContext';
import {Dropdown} from 'react-native-element-dropdown';

const HeaderDropdown = () => {
  const navigation = useNavigation();
  const userController = useUserController();
  const [value, setValue] = useState(null);
  const {user, setUser, setVehicles, setInterestPoints, setJourneys, setUserInfo} = useAsyncStorage();

  const dropdownMenu = [
    {label: 'Preferences', value: 'preferences'},
    {label: 'Delete User', value: 'delete'},
    {label: 'Logout', value: 'logout'},
  ];

  const navigateToPreferences = () => {
    navigation.navigate('Preferences');
  }

  // Eliminar usuario
  const deleteUser = () => {
    Alert.alert('DELETE ACCOUNT', 'Do you want to delete this user account?', [
      {
        text: 'OK',
        onPress: async () => {
          try {
            if (!user) {
              Alert.alert('Error', 'User information not found.');
              return;
            }
            await userController.deleteUser(user.email);
            setInterestPoints(null);
            setUser(null);
            setVehicles(null);
            setJourneys(null);
            setUserInfo(null);
            Alert.alert('Account succesfully deleted.');
            navigation.navigate('Login');
          } catch (error) {
            let message = 'An error occurred. Please try again.';
            switch (error.code) {
              case 'UserNotFoundException':
                message = "User doesn't exist.";
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

  //Logout
  const logout = () => {
    Alert.alert('LOGOUT', 'Do you want to log out of this user account?', [
      {
        text: 'OK',
        onPress: async ()  => {
          try {
            if (!user) {
              Alert.alert('Error', 'User information not found.');
              return;
            }
            await userController.logout(user.email);
            setInterestPoints(null);
            setUser(null);
            setVehicles(null);
            setJourneys(null);
            setUserInfo(null);
            Alert.alert('Logged out succesfully.');
            navigation.navigate('Login');
          } catch (error) {
            let message = 'An error occurred. Please try again.';
            switch (error.code) {
              case 'UserNotFoundException':
                message = "User doesn't exist.";
                break;
              default:
                console.log(error);
                break;
            }
            Alert.alert('Logout Error', message);
          }
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  // Menú en cabecera
  const handleMenu = value => {
    switch (value) {
      case 'preferences':
        navigateToPreferences();
        break;
      case 'delete':
        deleteUser();
        break;
      case 'logout':
        logout();
        break;
      default:
        console.log('nada');
        break;
    }
  };

  // Desplegable del menú de cabecera
  const renderItem = item => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.label}</Text>
      </View>
    );
  };

  // Icono del desplegable customizado
  const customIcon = () => {
    return (
      <MaterialCommunityIcons
        name={'cog'}
        size={30}
        color={globalStyles.white.backgroundColor}
      />
    );
  };

  return (
    <Dropdown
      style={styles.dropdown}
      iconStyle={styles.iconStyle}
      data={dropdownMenu}
      labelField="label"
      valueField="value"
      placeholderStyle={{color: 'transparent'}}
      selectedTextStyle={{color: 'transparent'}}
      onChange={async item => {
        setValue(item.value);
        handleMenu(item.value);
      }}
      renderRightIcon={customIcon}
      value={value}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    margin: 10,
    height: 30,
    width: 150,
    backgroundColor: 'transparent',
    borderRadius: 1,
    padding: 5,
    elevation: 0,
  },
  item: {
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  placeholder: {
    color: 'white',
    fontSize: 14,
  },
});

export default HeaderDropdown;
