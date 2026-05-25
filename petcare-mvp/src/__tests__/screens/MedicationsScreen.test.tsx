import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { act } from 'react';
import { usePetStore } from '../../store/petStore';
import { MedicationsScreen } from '../../screens/MedicationsScreen';

const makeProps = (petId: string) => ({
  navigation: { navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() } as any,
  route: { params: { petId } } as any,
});

const DEFAULT_PET = {
  name: 'Charlie', type: 'dog' as const, breed: 'Poodle', gender: 'male' as const,
  weightKg: 10, dateOfBirth: '2019-05-10T00:00:00.000Z',
  foodTargetGrams: 200, waterTargetServings: 3,
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

describe('MedicationsScreen', () => {
  it('returns null for unknown petId', () => {
    const { toJSON } = render(<MedicationsScreen {...makeProps('unknown')} />);
    expect(toJSON()).toBeNull();
  });

  it('shows empty state when no medications', () => {
    const pet = addTestPet();
    const { getByText } = render(<MedicationsScreen {...makeProps(pet.id)} />);
    expect(getByText('No medications added yet.')).toBeTruthy();
  });

  it('opens add modal on button press', () => {
    const pet = addTestPet();
    const { getByText } = render(<MedicationsScreen {...makeProps(pet.id)} />);
    fireEvent.press(getByText('+ Add Medication'));
    expect(getByText('Add Medication')).toBeTruthy();
  });

  it('adds a medication with valid data', () => {
    const pet = addTestPet();
    const { getByText, getByPlaceholderText } = render(<MedicationsScreen {...makeProps(pet.id)} />);
    fireEvent.press(getByText('+ Add Medication'));
    fireEvent.changeText(getByPlaceholderText('e.g., Heartgard Plus'), 'Apoquel');
    fireEvent.changeText(getByPlaceholderText('e.g., 1 chewable'), '16mg');
    fireEvent.press(getByText('Save'));
    const updated = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
    expect(updated.medications).toHaveLength(1);
    expect(updated.medications[0].name).toBe('Apoquel');
  });

  it('logs a dose for existing medication', () => {
    const pet = addTestPet();
    act(() => {
      usePetStore.getState().addMedication(pet.id, {
        name: 'Vetmedin', dosage: '5mg',
        frequency: 'daily', startDate: new Date().toISOString(),
      });
    });
    const { getByText } = render(<MedicationsScreen {...makeProps(pet.id)} />);
    fireEvent.press(getByText('Log Dose'));
    const updated = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
    expect(updated.medications[0].logs).toHaveLength(1);
  });
});
