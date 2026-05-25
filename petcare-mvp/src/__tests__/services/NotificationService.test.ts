import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermission,
  scheduleVaccineReminders,
  scheduleBirthdayReminders,
  scheduleDailyFeedingReminder,
  cancelAllReminders,
} from '../../services/NotificationService';
import { Pet } from '../../types/PetCare';

const BASE_PET: Pet = {
  id: 'p1',
  name: 'Buddy',
  type: 'dog',
  breed: 'Labrador',
  gender: 'male',
  weightKg: 25,
  dateOfBirth: '2020-01-01T00:00:00.000Z',
  avatarUri: undefined,
  foodTargetGrams: 300,
  waterTargetServings: 4,
  vet: { name: '', clinic: '', phone: '', notes: '' },
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
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('NotificationService', () => {
  describe('requestNotificationPermission', () => {
    it('returns true when permission already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: true, status: 'granted' });
      const result = await requestNotificationPermission();
      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests permission when not granted and returns result', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false, status: 'denied' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: true, status: 'granted' });
      const result = await requestNotificationPermission();
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('returns false when permission denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false, status: 'denied' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false, status: 'denied' });
      const result = await requestNotificationPermission();
      expect(result).toBe(false);
    });
  });

  describe('scheduleVaccineReminders', () => {
    it('cancels all previous notifications before scheduling', async () => {
      await scheduleVaccineReminders([]);
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    });

    it('schedules notification for future vaccine', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const pet: Pet = {
        ...BASE_PET,
        healthEvents: [{
          id: 'e1', type: 'vaccine', title: 'Rabies',
          date: futureDate.toISOString(),
          nextDueDate: futureDate.toISOString(),
        }],
      };
      await scheduleVaccineReminders([pet]);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.content.title).toContain('Buddy');
      expect(call.content.body).toContain('Rabies');
    });

    it('does not schedule for past vaccines', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      const pet: Pet = {
        ...BASE_PET,
        healthEvents: [{
          id: 'e2', type: 'vaccine', title: 'Old Vaccine',
          date: pastDate.toISOString(),
          nextDueDate: pastDate.toISOString(),
        }],
      };
      await scheduleVaccineReminders([pet]);
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('scheduleBirthdayReminders', () => {
    it('schedules birthday notification for pet with dob', async () => {
      await scheduleBirthdayReminders([BASE_PET]);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.content.title).toContain('Buddy');
    });

    it('skips pets without dateOfBirth', async () => {
      const { dateOfBirth: _dob, ...rest } = BASE_PET;
      const petNoDob: Pet = { ...rest };
      await scheduleBirthdayReminders([petNoDob]);
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('scheduleDailyFeedingReminder', () => {
    it('schedules daily feeding notification', async () => {
      await scheduleDailyFeedingReminder(8, 0);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(call.identifier).toBe('daily-feeding');
      expect(call.trigger).toMatchObject({ hour: 8, minute: 0 });
    });
  });

  describe('cancelAllReminders', () => {
    it('cancels all scheduled notifications', async () => {
      await cancelAllReminders();
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    });
  });
});
