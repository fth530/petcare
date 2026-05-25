import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { usePetStore } from '../../store/petStore';
import { SettingsScreen } from '../../screens/SettingsScreen';

const makeProps = () => ({
  navigation: { navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() } as any,
  route: {} as any,
});

beforeEach(() => {
  usePetStore.setState({ pets: [], hasHydrated: true, isLoading: false });
  jest.clearAllMocks();
});

describe('SettingsScreen', () => {
  describe('language picker', () => {
    it('renders all 8 language buttons', () => {
      const { getByText } = render(<SettingsScreen {...makeProps()} />);
      expect(getByText('🇬🇧 English')).toBeTruthy();
      expect(getByText('🇹🇷 Türkçe')).toBeTruthy();
      expect(getByText('🇩🇪 Deutsch')).toBeTruthy();
      expect(getByText('🇪🇸 Español')).toBeTruthy();
      expect(getByText('🇧🇷 Português')).toBeTruthy();
      expect(getByText('🇫🇷 Français')).toBeTruthy();
      expect(getByText('🇯🇵 日本語')).toBeTruthy();
      expect(getByText('🇮🇹 Italiano')).toBeTruthy();
    });

    it('pressing each language button does not throw', () => {
      const { getByText } = render(<SettingsScreen {...makeProps()} />);
      const langs = ['🇬🇧 English', '🇩🇪 Deutsch', '🇪🇸 Español', '🇧🇷 Português',
                     '🇫🇷 Français', '🇯🇵 日本語', '🇮🇹 Italiano', '🇹🇷 Türkçe'];
      for (const label of langs) {
        expect(() => fireEvent.press(getByText(label))).not.toThrow();
      }
    });
  });

  describe('sections', () => {
    it('renders Appearance section header', () => {
      const { getByText } = render(<SettingsScreen {...makeProps()} />);
      expect(getByText('APPEARANCE')).toBeTruthy();
    });

    it('renders Language section header', () => {
      const { getByText } = render(<SettingsScreen {...makeProps()} />);
      expect(getByText('LANGUAGE')).toBeTruthy();
    });

    it('renders Notifications section header', () => {
      const { getByText } = render(<SettingsScreen {...makeProps()} />);
      expect(getByText('NOTIFICATIONS')).toBeTruthy();
    });

    it('renders Data & Backup section header', () => {
      const { getByText } = render(<SettingsScreen {...makeProps()} />);
      expect(getByText('DATA & BACKUP')).toBeTruthy();
    });
  });

  describe('data actions', () => {
    it('renders Export Data button', () => {
      const { getByText } = render(<SettingsScreen {...makeProps()} />);
      expect(getByText('Export Data (JSON)')).toBeTruthy();
    });

    it('renders Clear All Data button', () => {
      const { getByText } = render(<SettingsScreen {...makeProps()} />);
      expect(getByText('Clear All Data')).toBeTruthy();
    });

    it('shows enable reminders toggle', () => {
      const { getByText } = render(<SettingsScreen {...makeProps()} />);
      expect(getByText('Enable Reminders')).toBeTruthy();
    });

    it('shows Dark Mode toggle', () => {
      const { getByText } = render(<SettingsScreen {...makeProps()} />);
      expect(getByText('Dark Mode')).toBeTruthy();
    });
  });
});
