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
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useUserController} from '../contexts/UserControllerContext';
import FormularioRegistroFactory from '../patrones/FactoryMethod/FormularioRegistroFactory';
const Register = () => {
  const navigation = useNavigation();
  const userController = useUserController();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [user, setUser] = useState('');

  const formularioRegistroFactory = new FormularioRegistroFactory();
  const formularioRegistro = formularioRegistroFactory.crearFormulario();
  const handleRegister = async () => {
    try {
      formularioRegistro.rellenarDatos({
        user,
        email,
        password1: password,
        password2,
      });
      await userController.register(formularioRegistro.datosFormulario);
      Alert.alert('Registered successfully.');
      navigation.navigate('Login');
    } catch (error) {
      let message = 'An error occurred. Please try again.';
      switch (error.code) {
        case 'NoInetConection':
          message = 'You need internet to register.';
          break;
        case 'NotSamePassException':
          message = 'The passwords dont match, please check them.';
          break;
        case 'InvalidEmailException':
          message = 'The email address  is invalid.';
          break;
        case 'InvalidPassException':
          message =
            'The password is invalid, it should be at least 6 characters with two numbers.';
          break;
        case 'InvalidUsernameException':
          message =
            'The username should at leat be 4 characters long.';
          break;
        case 'auth/email-already-in-use':
          message = 'The provided email is already in use by an existing user.';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Check your connection.';
          break;
        default:
          console.log(error);
          break;
      }
      Alert.alert('Register Error', message);
    }
  };

  return (
    <ScrollView style={[globalStyles.primary, { flex: 1, padding: 20 }]}
    showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
      <View>
        <Text style={globalStyles.mainText}>Register</Text>

        <TextInput
          cursorColor="black"
          mode="flat"
          label="User"
          style={styles.input}
          value={user}
          onChangeText={setUser}
        />

        <TextInput
          cursorColor="black"
          mode="flat"
          label="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
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

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TextInput
            secureTextEntry={!showPass2}
            cursorColor="black"
            mode="flat"
            label="Confirm Password"
            style={[styles.input, {flex: 1}]}
            value={password2}
            onChangeText={setPassword2}
          />
          <Pressable
            onPress={() => setShowPass2(!showPass2)}
            style={{marginLeft: 10}}>
            <MaterialCommunityIcons
              name={showPass2 ? 'eye-off' : 'eye'}
              size={24}
              color={globalStyles.white.backgroundColor}
            />
          </Pressable>
        </View>

        <Pressable
          style={[styles.button, globalStyles.secondary, {marginBottom: 30}]}
          onPress={handleRegister}>
          <Text style={styles.buttonText}>REGISTER</Text>
        </Pressable>

        <Pressable
          style={[styles.button, globalStyles.fullblack, {marginBottom: 30}]}
          onPress={() => navigation.navigate('Login')}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>
            Already have an account? Click here to log in.
          </Text>
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
});

export default Register;
