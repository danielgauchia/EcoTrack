import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);
jest.mock('@firebase/auth', () => ({
    ...jest.requireActual('@firebase/auth'),
    getReactNativePersistence: () => console.debug('Initialized persistence ...'),
  }));