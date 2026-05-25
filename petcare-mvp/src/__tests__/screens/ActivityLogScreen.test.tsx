import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { act } from 'react';
import { usePetStore } from '../../store/petStore';
import { ActivityLogScreen } from '../../screens/ActivityLogScreen';

const makeProps = (petId: string) => ({
  navigation: { navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() } as any,
  route: { params: { petId } } as any,
});

const DEFAULT_PET = {
  name: 'Rex', type: 'dog' as const, breed: 'Husky', gender: 'male' as const,
  weightKg: 28, dateOfBirth: '2020-06-15T00:00:00.000Z',
  foodTargetGrams: 350, waterTargetServings: 5,
  vet: { name: '', clinic: '', phone: '', notes: '' },
};

beforeEach(() => {
  usePetStore.setState({ pets: [], hasHydrated: true, isLoading: false });
  jest.clearAllMocks();
});

const addTestPet = () => {
  act(() => { usePetStore.getState().addPet(DEFAULT_PET); });
  return usePetStore.getState().pets[0];
};

describe('ActivityLogScreen', () => {
  it('returns null for unknown petId', () => {
    const { toJSON } = render(<ActivityLogScreen {...makeProps('unknown')} />);
    expect(toJSON()).toBeNull();
  });

  it('shows empty state when no activities', () => {
    const pet = addTestPet();
    const { getByText } = render(<ActivityLogScreen {...makeProps(pet.id)} />);
    expect(getByText('No activities logged yet.')).toBeTruthy();
  });

  it('shows 30-day stats section', () => {
    const pet = addTestPet();
    const { getByText } = render(<ActivityLogScreen {...makeProps(pet.id)} />);
    expect(getByText('min (30d)')).toBeTruthy();
    expect(getByText('km (30d)')).toBeTruthy();
  });

  it('opens add modal on button press', () => {
    const pet = addTestPet();
    const { getByText } = render(<ActivityLogScreen {...makeProps(pet.id)} />);
    fireEvent.press(getByText('+ Log Activity'));
    expect(getByText('Log Activity')).toBeTruthy();
  });

  it('adds activity with valid duration', () => {
    const pet = addTestPet();
    const { getByText, getByPlaceholderText } = render(<ActivityLogScreen {...makeProps(pet.id)} />);
    fireEvent.press(getByText('+ Log Activity'));
    fireEvent.changeText(getByPlaceholderText('30'), '45');
    fireEvent.press(getByText('Save'));
    const updated = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
    expect(updated.activityLogs).toHaveLength(1);
    expect(updated.activityLogs[0].durationMinutes).toBe(45);
  });

  it('rejects zero duration', () => {
    const pet = addTestPet();
    const { getByText, getByPlaceholderText } = render(<ActivityLogScreen {...makeProps(pet.id)} />);
    fireEvent.press(getByText('+ Log Activity'));
    fireEvent.changeText(getByPlaceholderText('30'), '0');
    fireEvent.press(getByText('Save'));
    const updated = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
    expect(updated.activityLogs).toHaveLength(0);
  });
});
