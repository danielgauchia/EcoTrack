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
import {useUserController} from '../contexts/UserControllerContext';
import {useAsyncStorage} from '../contexts/AsyncStorageContext';
import FormularioLoginFactory from '../patrones/FactoryMethod/FormularioLoginFactory';
const Login = () => {
  const navigation = useNavigation();
  const userController = useUserController();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const {user, setUser} = useAsyncStorage();
  const formularioLoginFactory = new FormularioLoginFactory();
  const formularioLogin = formularioLoginFactory.crearFormulario();
  useEffect(() => {
    if (user) {
      navigation.navigate('TabBar', { screen: 'Home' });

    }
  }, [user]);

  const handleLogin = async () => {
    try {
      formularioLogin.rellenarDatos({email, password});
      setUser(await userController.login(formularioLogin.datosFormulario));
      navigation.navigate('TabBar', { screen: 'Home' });

    } catch (error) {
      let message = 'An error occurred. Please try again.';
      switch (error.code) {
        case 'NoVerificatedUser':
          message = 'Please verify your email.';
          break;
        case 'NoInetConection':
          message = 'You need internet to login.';
          break;
        case 'InvalidEmailException':
          message = 'The email address  is invalid.';
          break;
        case 'InvalidPassException':
          message =
            'The password is invalid, it should be at least 6 characters with two numbers.';
          break;
        case 'auth/invalid-email':
          message = 'The email address is invalid.';
          break;
        case 'auth/invalid-login-credentials':
          message = 'There isnt any user found with those credentials.';
          break;
        case 'auth/user-disabled':
          message = 'Your account has been disabled.';
          break;
        case 'auth/user-not-found':
          message = 'User not found.';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password.';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Check your connection.';
          break;
        default:
          console.log(error);
          break;
      }
      Alert.alert('Login Error', message);
    }
  };

  return (
    <ScrollView style={[globalStyles.primary, { flex: 1, padding: 20 }]}
    showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
      <View>
        <Text style={globalStyles.mainText}>Log In</Text>
        <TextInput
          cursorColor="black"
          mode="flat"
          label="Email"
          style={styles.input}
          value={email}
          onChangeText={text => setEmail(text)}
        />
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TextInput
            secureTextEntry={!showPass}
            cursorColor="black"
            mode="flat"
            label="Password"
            style={[styles.input, {flex: 1}]}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            onPress={() => setShowPass(!showPass)}
            style={{marginLeft: 10}}>
            <MaterialCommunityIcons
              name={showPass ? 'eye-off' : 'eye'}
              size={24}
              color={globalStyles.white.backgroundColor}
            />
          </Pressable>
        </View>
        <Pressable
          style={[
            styles.button,
            globalStyles.secondary,
            {marginTop: 0, marginBottom: 30},
          ]}
          onPress={handleLogin}>
          <Text style={styles.buttonText}>LOG IN</Text>
        </Pressable>
        <Pressable
          style={[
            styles.button,
            globalStyles.fullblack,
            {marginTop: 0, marginBottom: 30},
          ]}
          onPress={() => {
            navigation.navigate('Register');
          }}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>
            Dont have an account? Click here to register.
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  appLogo: {
    height: 200,
    width: 250,
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
});

export default Login;
