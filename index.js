import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { AsyncStorageProvider } from './contexts/AsyncStorageContext';
const AppWithProvider = () => (
  <AsyncStorageProvider>
    <App />
  </AsyncStorageProvider>
);

AppRegistry.registerComponent(appName, () => AppWithProvider);
