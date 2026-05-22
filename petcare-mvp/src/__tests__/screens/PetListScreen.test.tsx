import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { usePetStore } from '../../store/petStore';
import { PetListScreen } from '../../screens/PetListScreen';
import { act } from 'react';

const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();

const navigation = {
  navigate: mockNavigate,
  setOptions: mockSetOptions,
  goBack: jest.fn(),
} as any;

const route = {} as any;

beforeEach(() => {
  usePetStore.setState({ pets: [], hasHydrated: true, isLoading: false });
  jest.clearAllMocks();
});

describe('PetListScreen', () => {
  it('shows empty state when there are no pets', () => {
    const { getByText } = render(
      <PetListScreen navigation={navigation} route={route} />
    );
    expect(getByText('Welcome to PetCare!')).toBeTruthy();
    expect(getByText('Add Your First Pet')).toBeTruthy();
  });

  it('shows pet list when pets exist', () => {
    act(() => {
      usePetStore.getState().addPet({
        name: 'Max',
        type: 'dog',
        breed: 'Golden Retriever',
        dateOfBirth: '2021-01-01T00:00:00.000Z',
        gender: 'male',
        weightKg: 30,
      });
    });
    const { getByText } = render(
      <PetListScreen navigation={navigation} route={route} />
    );
    expect(getByText('Max')).toBeTruthy();
    expect(getByText('Golden Retriever')).toBeTruthy();
  });

  it('navigates to AddEditPet on empty state button press', () => {
    const { getByText } = render(
      <PetListScreen navigation={navigation} route={route} />
    );
    fireEvent.press(getByText('Add Your First Pet'));
    expect(mockNavigate).toHaveBeenCalledWith('AddEditPet', {});
  });

  it('navigates to PetProfile when a pet is pressed', () => {
    act(() => {
      usePetStore.getState().addPet({
        name: 'Luna',
        type: 'cat',
        breed: 'Siamese',
        dateOfBirth: '2020-03-15T00:00:00.000Z',
        gender: 'female',
        weightKg: 4,
      });
    });
    const [pet] = usePetStore.getState().pets;
    const { getByText } = render(
      <PetListScreen navigation={navigation} route={route} />
    );
    fireEvent.press(getByText('Luna'));
    expect(mockNavigate).toHaveBeenCalledWith('PetProfile', { petId: pet.id });
  });

  it('renders multiple pets', () => {
    act(() => {
      const base = { type: 'dog' as const, breed: 'Lab', dateOfBirth: '', gender: 'male' as const, weightKg: 10 };
      usePetStore.getState().addPet({ ...base, name: 'Buddy' });
      usePetStore.getState().addPet({ ...base, name: 'Rex' });
      usePetStore.getState().addPet({ ...base, name: 'Coco' });
    });
    const { getByText } = render(
      <PetListScreen navigation={navigation} route={route} />
    );
    expect(getByText('Buddy')).toBeTruthy();
    expect(getByText('Rex')).toBeTruthy();
    expect(getByText('Coco')).toBeTruthy();
  });
});
