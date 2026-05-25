import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { act } from 'react';
import { usePetStore } from '../../store/petStore';
import { CareScheduleScreen } from '../../screens/CareScheduleScreen';

const makeProps = (petId: string) => ({
  navigation: { navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() } as any,
  route: { params: { petId } } as any,
});

const DEFAULT_PET = {
  name: 'Bella', type: 'cat' as const, breed: 'Siamese', gender: 'female' as const,
  weightKg: 4, dateOfBirth: '2021-03-01T00:00:00.000Z',
  foodTargetGrams: 150, waterTargetServings: 3,
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

describe('CareScheduleScreen', () => {
  it('returns null for unknown petId', () => {
    const { toJSON } = render(<CareScheduleScreen {...makeProps('unknown')} />);
    expect(toJSON()).toBeNull();
  });

  it('shows empty state when no tasks', () => {
    const pet = addTestPet();
    const { getByText } = render(<CareScheduleScreen {...makeProps(pet.id)} />);
    expect(getByText('No care tasks yet.')).toBeTruthy();
  });

  it('opens add modal via FAB', () => {
    const pet = addTestPet();
    const { getByLabelText, getByText } = render(<CareScheduleScreen {...makeProps(pet.id)} />);
    fireEvent.press(getByLabelText('Add Task'));
    expect(getByText('Add Task')).toBeTruthy();
  });

  it('adds a care task with valid name and frequency', () => {
    const pet = addTestPet();
    const { getByLabelText, getByPlaceholderText, getByText } = render(<CareScheduleScreen {...makeProps(pet.id)} />);
    fireEvent.press(getByLabelText('Add Task'));
    fireEvent.changeText(getByPlaceholderText('e.g., Bath'), 'Weekly Bath');
    fireEvent.press(getByText('Save'));
    const updated = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
    expect(updated.careTasks).toHaveLength(1);
    expect(updated.careTasks[0].name).toBe('Weekly Bath');
  });

  it('marks a task as done', () => {
    const pet = addTestPet();
    act(() => {
      usePetStore.getState().addCareTask(pet.id, { name: 'Nail Trim', type: 'nails', frequencyDays: 14 });
    });
    const updated = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
    const taskId = updated.careTasks[0].id;
    const { getByText } = render(<CareScheduleScreen {...makeProps(pet.id)} />);
    fireEvent.press(getByText('Mark Done'));
    const afterDone = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
    expect(afterDone.careTasks[0].lastDone).toBeTruthy();
    expect(afterDone.careTasks[0].id).toBe(taskId);
  });
});
