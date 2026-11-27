import React from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import { paperTheme } from './src/theme';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </PaperProvider>
    </Provider>
  );
}
