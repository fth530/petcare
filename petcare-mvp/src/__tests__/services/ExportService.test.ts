import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { exportPetsAsJSON } from '../../services/ExportService';
import { Pet } from '../../types/PetCare';

const MOCK_PET: Pet = {
  id: 'p1', name: 'Buddy', type: 'dog', breed: 'Labrador',
  gender: 'male', weightKg: 25, dateOfBirth: '2020-01-01T00:00:00.000Z',
  avatarUri: undefined, foodTargetGrams: 300, waterTargetServings: 4,
  vet: { name: '', clinic: '', phone: '', notes: '' },
  healthEvents: [], foodLogs: [], waterLogs: [], weightLogs: [],
  groomingLogs: [], medications: [], activityLogs: [], expenses: [],
  photos: [], careTasks: [], symptoms: [],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ExportService', () => {
  describe('exportPetsAsJSON', () => {
    it('writes pet data to a file', async () => {
      await exportPetsAsJSON([MOCK_PET]);
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledTimes(1);
      const [filePath, content] = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0];
      expect(filePath).toContain('petcare-backup');
      expect(filePath).toContain('.json');
      const parsed = JSON.parse(content);
      expect(parsed.pets).toHaveLength(1);
      expect(parsed.pets[0].name).toBe('Buddy');
    });

    it('shares the exported file', async () => {
      await exportPetsAsJSON([MOCK_PET]);
      expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
    });

    it('handles empty pet array', async () => {
      await exportPetsAsJSON([]);
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledTimes(1);
      const [, content] = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0];
      expect(JSON.parse(content).pets).toHaveLength(0);
    });
  });
});
