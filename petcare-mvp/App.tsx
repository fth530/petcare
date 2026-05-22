import React, { useEffect } from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import { usePetStore } from './src/store/petStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  const hasHydrated = usePetStore((state) => state.hasHydrated);
  const loadMockDataIfEmpty = usePetStore((state) => state.loadMockDataIfEmpty);

  useEffect(() => {
    if (hasHydrated) {
      loadMockDataIfEmpty();
    }
  }, [hasHydrated, loadMockDataIfEmpty]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
