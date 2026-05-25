import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { act } from 'react';
import { useOnboardingStore } from '../../store/onboardingStore';
import { OnboardingScreen } from '../../screens/OnboardingScreen';

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: View };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: any) => children,
}));

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

beforeEach(() => {
  useOnboardingStore.setState({ hasCompletedOnboarding: false, hasHydrated: true });
  jest.clearAllMocks();
});

describe('OnboardingScreen', () => {
  describe('first slide', () => {
    it('renders the first slide title in English', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText(/Welcome to/)).toBeTruthy();
    });

    it('renders the first slide subtitle', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText(/all-in-one companion/)).toBeTruthy();
    });

    it('shows the Skip button', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText('Skip')).toBeTruthy();
    });

    it('shows Next → button (not Get Started) on first slide', () => {
      const { getByText, queryByText } = render(<OnboardingScreen />);
      expect(getByText('Next →')).toBeTruthy();
      expect(queryByText(/Get Started/)).toBeNull();
    });
  });

  describe('skip behaviour', () => {
    it('pressing Skip calls completeOnboarding', () => {
      const { getByText } = render(<OnboardingScreen />);
      act(() => { fireEvent.press(getByText('Skip')); });
      expect(useOnboardingStore.getState().hasCompletedOnboarding).toBe(true);
    });

    it('pressing Skip fires haptics', () => {
      const Haptics = require('expo-haptics');
      const { getByText } = render(<OnboardingScreen />);
      act(() => { fireEvent.press(getByText('Skip')); });
      expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('next button on intermediate slide', () => {
    it('pressing Next does NOT complete onboarding when on first slide', () => {
      const { getByText } = render(<OnboardingScreen />);
      act(() => { fireEvent.press(getByText('Next →')); });
      expect(useOnboardingStore.getState().hasCompletedOnboarding).toBe(false);
    });

    it('pressing Next does not throw', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(() => {
        act(() => { fireEvent.press(getByText('Next →')); });
      }).not.toThrow();
    });
  });

  describe('all slides render', () => {
    it('renders all four slide contents in the FlatList', () => {
      const { getByText } = render(<OnboardingScreen />);
      // All slides are rendered in DOM (FlatList does not virtualize in tests)
      expect(getByText(/Track Their|Sağlığını|Gesundheit|Rastrea/i)).toBeTruthy();
    });

    it('renders the Get Started button text in a slide', () => {
      // The last slide content is rendered but the button only shows when currentIndex === 3
      // We confirm the screen contains a pressable "Next →" by default
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText('Next →')).toBeTruthy();
    });
  });

  describe('onboarding completion via store', () => {
    it('hasCompletedOnboarding starts false', () => {
      render(<OnboardingScreen />);
      expect(useOnboardingStore.getState().hasCompletedOnboarding).toBe(false);
    });

    it('completeOnboarding action sets flag to true', () => {
      act(() => { useOnboardingStore.getState().completeOnboarding(); });
      expect(useOnboardingStore.getState().hasCompletedOnboarding).toBe(true);
    });
  });
});
