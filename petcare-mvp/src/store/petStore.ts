import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet, HealthEvent, FoodLog, WaterLog } from '../types/PetCare';

interface PetStore {
  pets: Pet[];
  isLoading: boolean;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;

  addPet: (pet: Omit<Pet, 'id' | 'healthEvents' | 'foodLogs' | 'waterLogs'>) => void;
  updatePet: (petId: string, updates: Partial<Pet>) => void;
  deletePet: (petId: string) => void;

  addHealthEvent: (petId: string, event: Omit<HealthEvent, 'id'>) => void;
  updateHealthEvent: (petId: string, eventId: string, updates: Partial<Omit<HealthEvent, 'id'>>) => void;
  deleteHealthEvent: (petId: string, eventId: string) => void;

  addFoodLog: (petId: string, log: Omit<FoodLog, 'id'>) => void;
  addWaterLog: (petId: string, log: Omit<WaterLog, 'id'>) => void;

  loadMockDataIfEmpty: () => void;
}

const mockPet: Pet = {
  id: 'mock-1',
  name: 'Max',
  type: 'dog',
  breed: 'Golden Retriever',
  dateOfBirth: '2021-05-10T00:00:00.000Z',
  gender: 'male',
  weightKg: 32,
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
              ? {
                  ...pet,
                  healthEvents: [
                    ...pet.healthEvents,
                    { ...eventData, id: generateId() },
                  ],
                }
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
              ? {
                  ...pet,
                  healthEvents: pet.healthEvents.filter((e) => e.id !== eventId),
                }
              : pet
          ),
        })),

      addFoodLog: (petId, logData) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId
              ? {
                  ...pet,
                  foodLogs: [...pet.foodLogs, { ...logData, id: generateId() }],
                }
              : pet
          ),
        })),

      addWaterLog: (petId, logData) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId
              ? {
                  ...pet,
                  waterLogs: [...pet.waterLogs, { ...logData, id: generateId() }],
                }
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
