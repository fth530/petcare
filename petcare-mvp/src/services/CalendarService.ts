import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { HealthEvent } from '../types/PetCare';

async function getDefaultCalendarId(): Promise<string | null> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return null;

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const defaultCal = calendars.find(
    (c) => c.allowsModifications && (Platform.OS === 'ios' ? c.source?.isLocalAccount : true)
  );
  return defaultCal?.id ?? null;
}

export async function addHealthEventToCalendar(
  petName: string,
  event: HealthEvent
): Promise<boolean> {
  try {
    const calendarId = await getDefaultCalendarId();
    if (!calendarId) return false;

    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    await Calendar.createEventAsync(calendarId, {
      title: `${petName} — ${event.title}`,
      startDate,
      endDate,
      notes: event.notes,
      alarms: [{ relativeOffset: -60 * 24 }],
    });
    return true;
  } catch {
    return false;
  }
}

export async function addMedicationReminderToCalendar(
  petName: string,
  medName: string,
  dosage: string,
  date: Date
): Promise<boolean> {
  try {
    const calendarId = await getDefaultCalendarId();
    if (!calendarId) return false;

    const endDate = new Date(date.getTime() + 30 * 60 * 1000);

    await Calendar.createEventAsync(calendarId, {
      title: `${petName} — ${medName} (${dosage})`,
      startDate: date,
      endDate,
      alarms: [{ relativeOffset: -30 }],
    });
    return true;
  } catch {
    return false;
  }
}
