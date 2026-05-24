import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Pet } from '../types/PetCare';
import { parseISO, isFuture, subDays } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleVaccineReminders(pets: Pet[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const pet of pets) {
    for (const event of pet.healthEvents) {
      if (event.type === 'vaccine' && event.nextDueDate) {
        const due = parseISO(event.nextDueDate);
        const reminder = subDays(due, 3);
        if (isFuture(reminder)) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `🐾 ${pet.name} — Vaccine Due Soon`,
              body: `${event.title} is due in 3 days`,
              data: { petId: pet.id, eventId: event.id },
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder },
          });
        }
      }
    }
  }
}

export async function scheduleDailyFeedingReminder(hour: number, minute: number): Promise<void> {
  const id = 'daily-feeding';
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: '🍖 Time to feed your pets!',
      body: "Don't forget to log today's meal.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
