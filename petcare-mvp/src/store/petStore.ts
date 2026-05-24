import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet, HealthEvent, FoodLog, WaterLog, WeightLog, GroomingLog } from '../types/PetCare';
import { FOOD_TARGET_GRAMS, WATER_TARGET_SERVINGS } from '../constants';

interface PetStore {
  pets: Pet[];
  isLoading: boolean;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;

  addPet: (pet: Omit<Pet, 'id' | 'healthEvents' | 'foodLogs' | 'waterLogs' | 'weightLogs' | 'groomingLogs'>) => void;
  updatePet: (petId: string, updates: Partial<Pet>) => void;
  deletePet: (petId: string) => void;

  addHealthEvent: (petId: string, event: Omit<HealthEvent, 'id'>) => void;
  updateHealthEvent: (petId: string, eventId: string, updates: Partial<Omit<HealthEvent, 'id'>>) => void;
  deleteHealthEvent: (petId: string, eventId: string) => void;

  addFoodLog: (petId: string, log: Omit<FoodLog, 'id'>) => void;
  addWaterLog: (petId: string, log: Omit<WaterLog, 'id'>) => void;

  addWeightLog: (petId: string, log: Omit<WeightLog, 'id'>) => void;
  deleteWeightLog: (petId: string, logId: string) => void;

  addGroomingLog: (petId: string, log: Omit<GroomingLog, 'id'>) => void;
  deleteGroomingLog: (petId: string, logId: string) => void;

  loadMockDataIfEmpty: () => void;
}

const DEFAULT_VET = { name: '', clinic: '', phone: '', notes: '' };

const mockPet: Pet = {
  id: 'mock-1',
  name: 'Max',
  type: 'dog',
  breed: 'Golden Retriever',
  dateOfBirth: '2021-05-10T00:00:00.000Z',
  gender: 'male',
  weightKg: 32,
  foodTargetGrams: 320,
  waterTargetServings: 4,
  vet: { name: 'Dr. Smith', clinic: 'City Vet Clinic', phone: '+1 555 0123', notes: '' },
  healthEvents: [
    {
      id: 'event-1',
      type: 'vaccine',
      title: 'Rabies Booster',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      nextDueDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'event-2',
      type: 'vet_visit',
      title: 'Annual Checkup',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  foodLogs: [
    { id: 'food-1', date: new Date().toISOString(), amountGrams: 150 },
  ],
  waterLogs: [
    { id: 'water-1', date: new Date().toISOString(), servings: 2 },
  ],
  weightLogs: [
    { id: 'w-1', date: new Date(Date.now() - 90 * 86400000).toISOString(), weightKg: 30 },
    { id: 'w-2', date: new Date(Date.now() - 60 * 86400000).toISOString(), weightKg: 31 },
    { id: 'w-3', date: new Date(Date.now() - 30 * 86400000).toISOString(), weightKg: 31.5 },
    { id: 'w-4', date: new Date().toISOString(), weightKg: 32 },
  ],
  groomingLogs: [
    { id: 'g-1', date: new Date(Date.now() - 14 * 86400000).toISOString(), type: 'bath' },
    { id: 'g-2', date: new Date(Date.now() - 7 * 86400000).toISOString(), type: 'nails' },
  ],
};

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      pets: [],
      isLoading: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      loadMockDataIfEmpty: () => {
        if (get().pets.length === 0) {
          set({ pets: [mockPet] });
        }
      },

      addPet: (petData) =>
        set((state) => ({
          pets: [
            ...state.pets,
            {
              ...petData,
              id: generateId(),
              healthEvents: [],
              foodLogs: [],
              waterLogs: [],
              weightLogs: [],
              groomingLogs: [],
            },
          ],
        })),

      updatePet: (petId, updates) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId ? { ...pet, ...updates } : pet
          ),
        })),

      deletePet: (petId) =>
        set((state) => ({
          pets: state.pets.filter((pet) => pet.id !== petId),
        })),

      addHealthEvent: (petId, eventData) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId
              ? { ...pet, healthEvents: [...pet.healthEvents, { ...eventData, id: generateId() }] }
              : pet
          ),
        })),

      updateHealthEvent: (petId, eventId, updates) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId
              ? {
                  ...pet,
                  healthEvents: pet.healthEvents.map((e) =>
                    e.id === eventId ? { ...e, ...updates } : e
                  ),
                }
              : pet
          ),
        })),

      deleteHealthEvent: (petId, eventId) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId
              ? { ...pet, healthEvents: pet.healthEvents.filter((e) => e.id !== eventId) }
              : pet
          ),
        })),

      addFoodLog: (petId, logData) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId
              ? { ...pet, foodLogs: [...pet.foodLogs, { ...logData, id: generateId() }] }
              : pet
          ),
        })),

      addWaterLog: (petId, logData) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId
              ? { ...pet, waterLogs: [...pet.waterLogs, { ...logData, id: generateId() }] }
              : pet
          ),
        })),

      addWeightLog: (petId, logData) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId
              ? { ...pet, weightLogs: [...(pet.weightLogs ?? []), { ...logData, id: generateId() }] }
              : pet
          ),
        })),

      deleteWeightLog: (petId, logId) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId
              ? { ...pet, weightLogs: (pet.weightLogs ?? []).filter((l) => l.id !== logId) }
              : pet
          ),
        })),

      addGroomingLog: (petId, logData) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId
              ? { ...pet, groomingLogs: [...(pet.groomingLogs ?? []), { ...logData, id: generateId() }] }
              : pet
          ),
        })),

      deleteGroomingLog: (petId, logId) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId
              ? { ...pet, groomingLogs: (pet.groomingLogs ?? []).filter((l) => l.id !== logId) }
              : pet
          ),
        })),
    }),
    {
      name: 'petcare-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ pets: state.pets }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
