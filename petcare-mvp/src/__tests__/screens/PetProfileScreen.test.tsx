import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { usePetStore } from '../../store/petStore';
import { PetProfileScreen } from '../../screens/PetProfileScreen';
import { act } from 'react';

const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();

const makeNavigation = (petId: string) => ({
  navigate: mockNavigate,
  setOptions: mockSetOptions,
  goBack: jest.fn(),
  route: { params: { petId } },
});

beforeEach(() => {
  usePetStore.setState({ pets: [], hasHydrated: true, isLoading: false });
  jest.clearAllMocks();
});

const DEFAULT_VET = { name: '', clinic: '', phone: '', notes: '' };

const addTestPet = () => {
  act(() => {
    usePetStore.getState().addPet({
      name: 'Max',
      type: 'dog',
      breed: 'Golden Retriever',
      dateOfBirth: '2021-01-01T00:00:00.000Z',
      gender: 'male',
      weightKg: 32,
      foodTargetGrams: 300,
      waterTargetServings: 4,
      vet: DEFAULT_VET,
    });
  });
  return usePetStore.getState().pets[0];
};

describe('PetProfileScreen', () => {
  it('shows "Pet not found" for invalid petId', () => {
    const navigation = makeNavigation('non-existent-id') as any;
    const route = { params: { petId: 'non-existent-id' } } as any;
    const { getByText } = render(
      <PetProfileScreen navigation={navigation} route={route} />
    );
    expect(getByText('Pet not found.')).toBeTruthy();
  });

  it('renders pet name and breed', () => {
    const pet = addTestPet();
    const navigation = makeNavigation(pet.id) as any;
    const route = { params: { petId: pet.id } } as any;
    const { getByText } = render(
      <PetProfileScreen navigation={navigation} route={route} />
    );
    expect(getByText('Max')).toBeTruthy();
    expect(getByText('Golden Retriever, 32 kg')).toBeTruthy();
  });

  it("shows Today's Nutrition section", () => {
    const pet = addTestPet();
    const navigation = makeNavigation(pet.id) as any;
    const route = { params: { petId: pet.id } } as any;
    const { getByText } = render(
      <PetProfileScreen navigation={navigation} route={route} />
    );
    expect(getByText("Today's Nutrition")).toBeTruthy();
  });

  it('shows food modal when + Food is pressed', () => {
    const pet = addTestPet();
    const navigation = makeNavigation(pet.id) as any;
    const route = { params: { petId: pet.id } } as any;
    const { getByText } = render(
      <PetProfileScreen navigation={navigation} route={route} />
    );
    fireEvent.press(getByText('+ Food'));
    expect(getByText('Log Food')).toBeTruthy();
  });

  it('adds food log on valid amount entry', () => {
    const pet = addTestPet();
    const navigation = makeNavigation(pet.id) as any;
    const route = { params: { petId: pet.id } } as any;
    const { getByText, getByPlaceholderText } = render(
      <PetProfileScreen navigation={navigation} route={route} />
    );
    fireEvent.press(getByText('+ Food'));
    fireEvent.changeText(getByPlaceholderText('Amount in grams (e.g., 150)'), '200');
    fireEvent.press(getByText('Save'));
    const updatedPet = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
    expect(updatedPet.foodLogs.length).toBeGreaterThan(0);
    expect(updatedPet.foodLogs[updatedPet.foodLogs.length - 1].amountGrams).toBe(200);
  });

  it('rejects food amount of 0', () => {
    const pet = addTestPet();
    const navigation = makeNavigation(pet.id) as any;
    const route = { params: { petId: pet.id } } as any;
    const { getByText, getByPlaceholderText } = render(
      <PetProfileScreen navigation={navigation} route={route} />
    );
    fireEvent.press(getByText('+ Food'));
    fireEvent.changeText(getByPlaceholderText('Amount in grams (e.g., 150)'), '0');
    fireEvent.press(getByText('Save'));
    const updatedPet = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
    expect(updatedPet.foodLogs).toHaveLength(0);
  });

  it('rejects food amount above 10000g', () => {
    const pet = addTestPet();
    const navigation = makeNavigation(pet.id) as any;
    const route = { params: { petId: pet.id } } as any;
    const { getByText, getByPlaceholderText } = render(
      <PetProfileScreen navigation={navigation} route={route} />
    );
    fireEvent.press(getByText('+ Food'));
    fireEvent.changeText(getByPlaceholderText('Amount in grams (e.g., 150)'), '99999');
    fireEvent.press(getByText('Save'));
    const updatedPet = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
    expect(updatedPet.foodLogs).toHaveLength(0);
  });

  it('adds water log when + Water is pressed', () => {
    const pet = addTestPet();
    const navigation = makeNavigation(pet.id) as any;
    const route = { params: { petId: pet.id } } as any;
    const { getByText } = render(
      <PetProfileScreen navigation={navigation} route={route} />
    );
    fireEvent.press(getByText('+ Water'));
    const updatedPet = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
    expect(updatedPet.waterLogs.length).toBeGreaterThan(0);
  });

  it('shows Health Calendar section', () => {
    const pet = addTestPet();
    const navigation = makeNavigation(pet.id) as any;
    const route = { params: { petId: pet.id } } as any;
    const { getByText } = render(
      <PetProfileScreen navigation={navigation} route={route} />
    );
    expect(getByText('Health Calendar')).toBeTruthy();
  });
});
