import React, { useEffect } from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import { usePetStore } from './src/store/petStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { I18nProvider } from './src/i18n';

function AppInner() {
  const hasHydrated = usePetStore((state) => state.hasHydrated);
  const loadMockDataIfEmpty = usePetStore((state) => state.loadMockDataIfEmpty);
  const { isDark } = useTheme();

  useEffect(() => {
    if (hasHydrated) loadMockDataIfEmpty();
  }, [hasHydrated, loadMockDataIfEmpty]);

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <AppInner />
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
