import React, { useEffect } from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import { usePetStore } from './src/store/petStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const loadMockDataIfEmpty = usePetStore(state => state.loadMockDataIfEmpty);

  useEffect(() => {
    loadMockDataIfEmpty();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
