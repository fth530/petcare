import React, { useEffect } from 'react';
import { View } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { usePetStore } from './src/store/petStore';
import { useOnboardingStore } from './src/store/onboardingStore';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { I18nProvider } from './src/i18n';

function AppInner() {
  const petHasHydrated = usePetStore((state) => state.hasHydrated);
  const onboardingHasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const loadMockDataIfEmpty = usePetStore((state) => state.loadMockDataIfEmpty);
  const { isDark, colors } = useTheme();
  const hasCompletedOnboarding = useOnboardingStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    if (petHasHydrated) loadMockDataIfEmpty();
  }, [petHasHydrated, loadMockDataIfEmpty]);

  const isReady = petHasHydrated && onboardingHasHydrated;

  if (!hasCompletedOnboarding) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OnboardingScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {isReady ? (
        <RootNavigator />
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.background }} />
      )}
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
