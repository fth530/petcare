import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { act } from 'react';
import { usePetStore } from '../../store/petStore';
import { BudgetScreen } from '../../screens/BudgetScreen';

const mockNavigate = jest.fn();
const makeProps = (petId: string) => ({
  navigation: { navigate: mockNavigate, goBack: jest.fn(), setOptions: jest.fn() } as any,
  route: { params: { petId } } as any,
});

const DEFAULT_PET = {
  name: 'Max', type: 'dog' as const, breed: 'Lab', gender: 'male' as const,
  weightKg: 30, dateOfBirth: '2020-01-01T00:00:00.000Z',
  foodTargetGrams: 300, waterTargetServings: 4,
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

describe('BudgetScreen', () => {
  it('returns null for unknown petId', () => {
    const { toJSON } = render(<BudgetScreen {...makeProps('unknown')} />);
    expect(toJSON()).toBeNull();
  });

  it('shows empty state when no expenses', () => {
    const pet = addTestPet();
    const { getAllByText } = render(<BudgetScreen {...makeProps(pet.id)} />);
    expect(getAllByText('No expenses recorded yet.').length).toBeGreaterThan(0);
  });

  it('shows zero total spent initially', () => {
    const pet = addTestPet();
    const { getByText, getAllByText } = render(<BudgetScreen {...makeProps(pet.id)} />);
    expect(getByText('Total')).toBeTruthy();
    expect(getAllByText('$0').length).toBeGreaterThan(0);
  });

  it('opens add expense modal on button press', () => {
    const pet = addTestPet();
    const { getByText } = render(<BudgetScreen {...makeProps(pet.id)} />);
    fireEvent.press(getByText('+ Add Expense'));
    expect(getByText('Add Expense')).toBeTruthy();
  });

  it('adds expense with valid data', () => {
    const pet = addTestPet();
    const { getByText, getByPlaceholderText } = render(<BudgetScreen {...makeProps(pet.id)} />);
    fireEvent.press(getByText('+ Add Expense'));
    fireEvent.changeText(getByPlaceholderText('0.00'), '50');
    fireEvent.changeText(getByPlaceholderText('e.g., Annual checkup'), 'Checkup');
    fireEvent.press(getByText('Save'));
    const updated = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
    expect(updated.expenses).toHaveLength(1);
    expect(updated.expenses[0].amount).toBe(50);
  });

  it('rejects invalid amount', () => {
    const pet = addTestPet();
    const { getByText, getByPlaceholderText } = render(<BudgetScreen {...makeProps(pet.id)} />);
    fireEvent.press(getByText('+ Add Expense'));
    fireEvent.changeText(getByPlaceholderText('0.00'), '-5');
    fireEvent.changeText(getByPlaceholderText('e.g., Annual checkup'), 'Bad');
    fireEvent.press(getByText('Save'));
    const updated = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
    expect(updated.expenses).toHaveLength(0);
  });
});
