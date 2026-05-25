import * as Notifications from 'expo-notifications';
import { Pet } from '../types/PetCare';
import { parseISO, isFuture, subDays } from 'date-fns';

// Local notification handler — safe in Expo Go
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const existing = (await Notifications.getPermissionsAsync()) as unknown as { granted: boolean; status: string };
    if (existing.granted || existing.status === 'granted') return true;
    const newPerm = (await Notifications.requestPermissionsAsync()) as unknown as { granted: boolean; status: string };
    return newPerm.granted || newPerm.status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleVaccineReminders(pets: Pet[]): Promise<void> {
  try {
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
  } catch {}
}

export async function scheduleDailyFeedingReminder(hour: number, minute: number): Promise<void> {
  try {
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
  } catch {}
}

export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

export async function scheduleBirthdayReminders(pets: Pet[]): Promise<void> {
  try {
    for (const pet of pets) {
      if (!pet.dateOfBirth) continue;
      const dob = parseISO(pet.dateOfBirth);
      const now = new Date();
      let nextBirthday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
      if (nextBirthday <= now) nextBirthday = new Date(now.getFullYear() + 1, dob.getMonth(), dob.getDate());
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🎂 Happy Birthday, ${pet.name}!`,
          body: `Today is ${pet.name}'s birthday! Give them extra love!`,
          data: { petId: pet.id },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: nextBirthday },
      });
    }
  } catch {}
}
