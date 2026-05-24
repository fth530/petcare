import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Pet, HealthEvent, FoodLog, WaterLog, WeightLog, GroomingLog,
  Medication, MedicationDoseLog, ActivityLog, Expense, Photo,
  CareTask, Symptom,
} from '../types/PetCare';
import { FOOD_TARGET_GRAMS, WATER_TARGET_SERVINGS } from '../constants';

interface PetStore {
  pets: Pet[];
  isLoading: boolean;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;

  addPet: (pet: Omit<Pet, 'id' | 'healthEvents' | 'foodLogs' | 'waterLogs' | 'weightLogs' | 'groomingLogs' | 'medications' | 'activityLogs' | 'expenses' | 'photos' | 'careTasks' | 'symptoms'>) => void;
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

  addMedication: (petId: string, med: Omit<Medication, 'id' | 'logs'>) => void;
  updateMedication: (petId: string, medId: string, updates: Partial<Omit<Medication, 'id' | 'logs'>>) => void;
  deleteMedication: (petId: string, medId: string) => void;
  logMedicationDose: (petId: string, medId: string) => void;

  addActivityLog: (petId: string, log: Omit<ActivityLog, 'id'>) => void;
  deleteActivityLog: (petId: string, logId: string) => void;

  addExpense: (petId: string, expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (petId: string, expenseId: string) => void;

  addPhoto: (petId: string, photo: Omit<Photo, 'id'>) => void;
  deletePhoto: (petId: string, photoId: string) => void;

  addCareTask: (petId: string, task: Omit<CareTask, 'id'>) => void;
  updateCareTask: (petId: string, taskId: string, updates: Partial<Omit<CareTask, 'id'>>) => void;
  deleteCareTask: (petId: string, taskId: string) => void;
  markCareTaskDone: (petId: string, taskId: string) => void;

  addSymptom: (petId: string, symptom: Omit<Symptom, 'id'>) => void;
  deleteSymptom: (petId: string, symptomId: string) => void;

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
  medications: [
    {
      id: 'med-1',
      name: 'Heartgard Plus',
      dosage: '1 chewable',
      frequency: 'monthly',
      startDate: new Date(Date.now() - 90 * 86400000).toISOString(),
      notes: 'Give with food',
      logs: [
        { id: 'dose-1', date: new Date(Date.now() - 60 * 86400000).toISOString() },
        { id: 'dose-2', date: new Date(Date.now() - 30 * 86400000).toISOString() },
      ],
    },
  ],
  activityLogs: [
    { id: 'act-1', date: new Date(Date.now() - 2 * 86400000).toISOString(), type: 'walk', durationMinutes: 30, distanceKm: 2.5 },
    { id: 'act-2', date: new Date(Date.now() - 1 * 86400000).toISOString(), type: 'play', durationMinutes: 20 },
    { id: 'act-3', date: new Date().toISOString(), type: 'walk', durationMinutes: 45, distanceKm: 3.2 },
  ],
  expenses: [
    { id: 'exp-1', date: new Date(Date.now() - 30 * 86400000).toISOString(), category: 'vet', amount: 120, description: 'Annual Checkup' },
    { id: 'exp-2', date: new Date(Date.now() - 15 * 86400000).toISOString(), category: 'food', amount: 45, description: 'Dry food 10kg' },
    { id: 'exp-3', date: new Date(Date.now() - 7 * 86400000).toISOString(), category: 'medicine', amount: 28, description: 'Heartgard Plus' },
  ],
  photos: [],
  careTasks: [
    { id: 'ct-1', name: 'Bath', type: 'bath', frequencyDays: 14, lastDone: new Date(Date.now() - 12 * 86400000).toISOString() },
    { id: 'ct-2', name: 'Nail Trim', type: 'nails', frequencyDays: 21, lastDone: new Date(Date.now() - 18 * 86400000).toISOString() },
    { id: 'ct-3', name: 'Dental', type: 'dental', frequencyDays: 7 },
  ],
  symptoms: [],
};

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const patchPet = (pets: Pet[], petId: string, fn: (pet: Pet) => Partial<Pet>): Pet[] =>
  pets.map((p) => (p.id === petId ? { ...p, ...fn(p) } : p));

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
              medications: [],
              activityLogs: [],
              expenses: [],
              photos: [],
              careTasks: [],
              symptoms: [],
            },
          ],
        })),

      updatePet: (petId, updates) =>
        set((state) => ({ pets: patchPet(state.pets, petId, () => updates) })),

      deletePet: (petId) =>
        set((state) => ({ pets: state.pets.filter((pet) => pet.id !== petId) })),

      addHealthEvent: (petId, eventData) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            healthEvents: [...p.healthEvents, { ...eventData, id: generateId() }],
          })),
        })),

      updateHealthEvent: (petId, eventId, updates) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            healthEvents: p.healthEvents.map((e) => (e.id === eventId ? { ...e, ...updates } : e)),
          })),
        })),

      deleteHealthEvent: (petId, eventId) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            healthEvents: p.healthEvents.filter((e) => e.id !== eventId),
          })),
        })),

      addFoodLog: (petId, logData) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            foodLogs: [...p.foodLogs, { ...logData, id: generateId() }],
          })),
        })),

      addWaterLog: (petId, logData) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            waterLogs: [...p.waterLogs, { ...logData, id: generateId() }],
          })),
        })),

      addWeightLog: (petId, logData) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            weightLogs: [...(p.weightLogs ?? []), { ...logData, id: generateId() }],
          })),
        })),

      deleteWeightLog: (petId, logId) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            weightLogs: (p.weightLogs ?? []).filter((l) => l.id !== logId),
          })),
        })),

      addGroomingLog: (petId, logData) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            groomingLogs: [...(p.groomingLogs ?? []), { ...logData, id: generateId() }],
          })),
        })),

      deleteGroomingLog: (petId, logId) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            groomingLogs: (p.groomingLogs ?? []).filter((l) => l.id !== logId),
          })),
        })),

      addMedication: (petId, medData) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            medications: [...(p.medications ?? []), { ...medData, id: generateId(), logs: [] }],
          })),
        })),

      updateMedication: (petId, medId, updates) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            medications: (p.medications ?? []).map((m) =>
              m.id === medId ? { ...m, ...updates } : m
            ),
          })),
        })),

      deleteMedication: (petId, medId) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            medications: (p.medications ?? []).filter((m) => m.id !== medId),
          })),
        })),

      logMedicationDose: (petId, medId) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            medications: (p.medications ?? []).map((m) =>
              m.id === medId
                ? { ...m, logs: [...m.logs, { id: generateId(), date: new Date().toISOString() }] }
                : m
            ),
          })),
        })),

      addActivityLog: (petId, logData) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            activityLogs: [...(p.activityLogs ?? []), { ...logData, id: generateId() }],
          })),
        })),

      deleteActivityLog: (petId, logId) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            activityLogs: (p.activityLogs ?? []).filter((l) => l.id !== logId),
          })),
        })),

      addExpense: (petId, expenseData) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            expenses: [...(p.expenses ?? []), { ...expenseData, id: generateId() }],
          })),
        })),

      deleteExpense: (petId, expenseId) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            expenses: (p.expenses ?? []).filter((e) => e.id !== expenseId),
          })),
        })),

      addPhoto: (petId, photoData) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            photos: [...(p.photos ?? []), { ...photoData, id: generateId() }],
          })),
        })),

      deletePhoto: (petId, photoId) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            photos: (p.photos ?? []).filter((ph) => ph.id !== photoId),
          })),
        })),

      addCareTask: (petId, taskData) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            careTasks: [...(p.careTasks ?? []), { ...taskData, id: generateId() }],
          })),
        })),

      updateCareTask: (petId, taskId, updates) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            careTasks: (p.careTasks ?? []).map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
          })),
        })),

      deleteCareTask: (petId, taskId) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            careTasks: (p.careTasks ?? []).filter((t) => t.id !== taskId),
          })),
        })),

      markCareTaskDone: (petId, taskId) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            careTasks: (p.careTasks ?? []).map((t) =>
              t.id === taskId ? { ...t, lastDone: new Date().toISOString() } : t
            ),
          })),
        })),

      addSymptom: (petId, symptomData) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            symptoms: [...(p.symptoms ?? []), { ...symptomData, id: generateId() }],
          })),
        })),

      deleteSymptom: (petId, symptomId) =>
        set((state) => ({
          pets: patchPet(state.pets, petId, (p) => ({
            symptoms: (p.symptoms ?? []).filter((s) => s.id !== symptomId),
          })),
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
