import React, { useEffect } from 'react';
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
  const hasHydrated = usePetStore((state) => state.hasHydrated);
  const loadMockDataIfEmpty = usePetStore((state) => state.loadMockDataIfEmpty);
  const { isDark } = useTheme();
  const hasCompletedOnboarding = useOnboardingStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    if (hasHydrated) loadMockDataIfEmpty();
  }, [hasHydrated, loadMockDataIfEmpty]);

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
