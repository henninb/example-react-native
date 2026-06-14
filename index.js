/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { ensureHumanSdkStarted } from './src/services/humanSecurity';

ensureHumanSdkStarted().catch(error => {
  console.warn('Human SDK failed to start:', error);
});

AppRegistry.registerComponent(appName, () => App);
