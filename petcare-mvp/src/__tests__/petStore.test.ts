import { act } from 'react';
import { usePetStore } from '../store/petStore';

// Reset store between tests
beforeEach(() => {
  usePetStore.setState({ pets: [], hasHydrated: true, isLoading: false });
});

describe('petStore', () => {
  describe('addPet', () => {
    it('adds a pet with generated id and empty logs', () => {
      const { addPet } = usePetStore.getState();
      act(() => {
        addPet({
          name: 'Buddy',
          type: 'dog',
          breed: 'Labrador',
          dateOfBirth: '2022-01-01T00:00:00.000Z',
          gender: 'male',
          weightKg: 20,
        });
      });
      const pets = usePetStore.getState().pets;
      expect(pets).toHaveLength(1);
      expect(pets[0].name).toBe('Buddy');
      expect(pets[0].id).toBeTruthy();
      expect(pets[0].healthEvents).toEqual([]);
      expect(pets[0].foodLogs).toEqual([]);
      expect(pets[0].waterLogs).toEqual([]);
    });

    it('generates unique ids for each pet', () => {
      const { addPet } = usePetStore.getState();
      const base = { type: 'dog' as const, breed: '', dateOfBirth: '', gender: 'male' as const, weightKg: 0 };
      act(() => {
        addPet({ ...base, name: 'Pet1' });
        addPet({ ...base, name: 'Pet2' });
      });
      const pets = usePetStore.getState().pets;
      expect(pets[0].id).not.toBe(pets[1].id);
    });
  });

  describe('updatePet', () => {
    it('updates only the matching pet', () => {
      const { addPet } = usePetStore.getState();
      const base = { type: 'cat' as const, breed: '', dateOfBirth: '', gender: 'female' as const, weightKg: 4 };
      act(() => {
        addPet({ ...base, name: 'Whiskers' });
        addPet({ ...base, name: 'Luna' });
      });
      const [pet1] = usePetStore.getState().pets;
      act(() => {
        usePetStore.getState().updatePet(pet1.id, { name: 'Mittens' });
      });
      const pets = usePetStore.getState().pets;
      expect(pets.find((p) => p.id === pet1.id)?.name).toBe('Mittens');
      expect(pets.find((p) => p.name === 'Luna')).toBeTruthy();
    });
  });

  describe('deletePet', () => {
    it('removes the correct pet', () => {
      const { addPet } = usePetStore.getState();
      const base = { type: 'dog' as const, breed: '', dateOfBirth: '', gender: 'male' as const, weightKg: 10 };
      act(() => {
        addPet({ ...base, name: 'Rex' });
        addPet({ ...base, name: 'Max' });
      });
      const [pet1] = usePetStore.getState().pets;
      act(() => {
        usePetStore.getState().deletePet(pet1.id);
      });
      const pets = usePetStore.getState().pets;
      expect(pets).toHaveLength(1);
      expect(pets[0].name).toBe('Max');
    });
  });

  describe('addHealthEvent', () => {
    it('adds event to correct pet', () => {
      const { addPet } = usePetStore.getState();
      act(() => {
        addPet({ name: 'Dog', type: 'dog', breed: '', dateOfBirth: '', gender: 'male', weightKg: 0 });
      });
      const [pet] = usePetStore.getState().pets;
      act(() => {
        usePetStore.getState().addHealthEvent(pet.id, {
          type: 'vaccine',
          title: 'Rabies',
          date: new Date().toISOString(),
        });
      });
      const updatedPet = usePetStore.getState().pets.find((p) => p.id === pet.id)!;
      expect(updatedPet.healthEvents).toHaveLength(1);
      expect(updatedPet.healthEvents[0].title).toBe('Rabies');
      expect(updatedPet.healthEvents[0].id).toBeTruthy();
    });
  });

  describe('updateHealthEvent', () => {
    it('updates the correct event', () => {
      const { addPet } = usePetStore.getState();
      act(() => {
        addPet({ name: 'Cat', type: 'cat', breed: '', dateOfBirth: '', gender: 'female', weightKg: 0 });
      });
      const [pet] = usePetStore.getState().pets;
      act(() => {
        usePetStore.getState().addHealthEvent(pet.id, { type: 'vaccine', title: 'Old Title', date: new Date().toISOString() });
      });
      const event = usePetStore.getState().pets.find((p) => p.id === pet.id)!.healthEvents[0];
      act(() => {
        usePetStore.getState().updateHealthEvent(pet.id, event.id, { title: 'New Title' });
      });
      const updated = usePetStore.getState().pets.find((p) => p.id === pet.id)!.healthEvents[0];
      expect(updated.title).toBe('New Title');
    });
  });

  describe('deleteHealthEvent', () => {
    it('removes event from correct pet', () => {
      const { addPet } = usePetStore.getState();
      act(() => {
        addPet({ name: 'Dog', type: 'dog', breed: '', dateOfBirth: '', gender: 'male', weightKg: 0 });
      });
      const [pet] = usePetStore.getState().pets;
      act(() => {
        usePetStore.getState().addHealthEvent(pet.id, { type: 'vaccine', title: 'Jab', date: new Date().toISOString() });
      });
      const event = usePetStore.getState().pets.find((p) => p.id === pet.id)!.healthEvents[0];
      act(() => {
        usePetStore.getState().deleteHealthEvent(pet.id, event.id);
      });
      expect(usePetStore.getState().pets.find((p) => p.id === pet.id)!.healthEvents).toHaveLength(0);
    });
  });

  describe('addFoodLog', () => {
    it('appends food log with generated id', () => {
      const { addPet } = usePetStore.getState();
      act(() => {
        addPet({ name: 'Dog', type: 'dog', breed: '', dateOfBirth: '', gender: 'male', weightKg: 0 });
      });
      const [pet] = usePetStore.getState().pets;
      act(() => {
        usePetStore.getState().addFoodLog(pet.id, { date: new Date().toISOString(), amountGrams: 150 });
      });
      const logs = usePetStore.getState().pets.find((p) => p.id === pet.id)!.foodLogs;
      expect(logs).toHaveLength(1);
      expect(logs[0].amountGrams).toBe(150);
      expect(logs[0].id).toBeTruthy();
    });
  });

  describe('addWaterLog', () => {
    it('appends water log with generated id', () => {
      const { addPet } = usePetStore.getState();
      act(() => {
        addPet({ name: 'Dog', type: 'dog', breed: '', dateOfBirth: '', gender: 'male', weightKg: 0 });
      });
      const [pet] = usePetStore.getState().pets;
      act(() => {
        usePetStore.getState().addWaterLog(pet.id, { date: new Date().toISOString(), servings: 2 });
      });
      const logs = usePetStore.getState().pets.find((p) => p.id === pet.id)!.waterLogs;
      expect(logs).toHaveLength(1);
      expect(logs[0].servings).toBe(2);
    });
  });

  describe('loadMockDataIfEmpty', () => {
    it('loads mock data when pets list is empty', () => {
      act(() => {
        usePetStore.getState().loadMockDataIfEmpty();
      });
      expect(usePetStore.getState().pets.length).toBeGreaterThan(0);
    });

    it('does not overwrite existing pets', () => {
      const { addPet } = usePetStore.getState();
      act(() => {
        addPet({ name: 'Existing', type: 'dog', breed: '', dateOfBirth: '', gender: 'male', weightKg: 0 });
        usePetStore.getState().loadMockDataIfEmpty();
      });
      expect(usePetStore.getState().pets).toHaveLength(1);
      expect(usePetStore.getState().pets[0].name).toBe('Existing');
    });
  });
});
