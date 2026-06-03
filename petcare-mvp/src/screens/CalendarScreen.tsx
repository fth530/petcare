import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { addHealthEventToCalendar } from '../services/CalendarService';
import { HealthEvent } from '../types/PetCare';

type Props = NativeStackScreenProps<RootStackParamList, 'Calendar'>;

const EVENT_COLORS: Record<HealthEvent['type'], string> = {
  vaccine: '#6c63ff',
  vet_visit: '#43b89c',
  medication: '#f59e0b',
  deworming: '#ef4444',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarScreen: React.FC<Props> = ({ route, navigation }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const eventsMap = useMemo(() => {
    const map: Record<string, HealthEvent[]> = {};
    if (!pet) return map;
    for (const event of pet.healthEvents) {
      const key = format(parseISO(event.date), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(event);
    }
    return map;
  }, [pet?.healthEvents]);

  const selectedDayEvents = useMemo(() => {
    const upcoming: { date: Date; event: HealthEvent }[] = [];
    if (!pet) return upcoming;
    for (const event of pet.healthEvents) {
      upcoming.push({ date: parseISO(event.date), event });
    }
    return upcoming
      .filter((e) => e.date >= startOfMonth(currentMonth) && e.date <= endOfMonth(currentMonth))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [pet?.healthEvents, currentMonth]);

  const startPadding = monthDays[0].getDay();

  const handleAddToCalendar = async (event: HealthEvent) => {
    if (!pet) return;
    const success = await addHealthEventToCalendar(pet.name, event);
    Alert.alert(
      success ? t('addedToCalendar') : t('permissionNeeded'),
      success ? `"${event.title}" ${t('eventAddedMsg')}` : t('calendarPermissionMsg')
    );
  };

  if (!pet) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Month navigation */}
      <View style={styles.monthNav}>
        <Pressable onPress={() => setCurrentMonth(subMonths(currentMonth, 1))} style={styles.navBtn} accessibilityRole="button" accessibilityLabel="Previous month">
          <Ionicons name="chevron-back" size={22} color={colors.primary[500]} />
        </Pressable>
        <Typography style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        <Pressable onPress={() => setCurrentMonth(addMonths(currentMonth, 1))} style={styles.navBtn} accessibilityRole="button" accessibilityLabel="Next month">
          <Ionicons name="chevron-forward" size={22} color={colors.primary[500]} />
        </Pressable>
      </View>

      {/* Calendar grid */}
      <Card style={[styles.calendarCard, { backgroundColor: colors.card }]}>
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((d) => (
            <Typography key={d} style={[styles.weekday, { color: colors.subtext }]}>{d}</Typography>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {Array.from({ length: startPadding }).map((_, i) => (
            <View key={`pad-${i}`} style={styles.dayCell} />
          ))}
          {monthDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const events = eventsMap[key] ?? [];
            const isT = isToday(day);
            return (
              <View key={key} style={[styles.dayCell, isT && { backgroundColor: colors.primary[100], borderRadius: 8 }]}>
                <Typography style={[styles.dayNum, { color: isT ? colors.primary[700] : colors.text, fontWeight: isT ? '700' : '400' }]}>
                  {day.getDate()}
                </Typography>
                <View style={styles.dotRow}>
                  {events.slice(0, 3).map((e) => (
                    <View key={e.id} style={[styles.dot, { backgroundColor: EVENT_COLORS[e.type] }]} />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Legend */}
      <View style={styles.legendRow}>
        {Object.entries(EVENT_COLORS).map(([type, color]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Typography style={{ fontSize: 11, color: colors.subtext }}>
              {t(type === 'vet_visit' ? 'vetVisit' : type === 'deworming' ? 'deworming' : type as any)}
            </Typography>
          </View>
        ))}
      </View>

      {/* Events this month */}
      <Typography variant="caption" style={[styles.sectionLabel, { color: colors.subtext }]}>
        {t('events').toUpperCase()} — {format(currentMonth, 'MMMM')}
      </Typography>
      {selectedDayEvents.length === 0 ? (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Ionicons name="calendar-outline" size={36} color={colors.neutral[300]} />
          <Typography variant="caption" style={{ color: colors.subtext, marginTop: 8 }}>{t('noEventsThisMonth')}</Typography>
        </Card>
      ) : (
        <Card style={{ backgroundColor: colors.card, padding: 0, overflow: 'hidden' }}>
          {selectedDayEvents.map((item, i) => (
            <View key={item.event.id} style={[styles.eventRow, { borderBottomColor: colors.border, borderBottomWidth: i < selectedDayEvents.length - 1 ? 1 : 0 }]}>
              <View style={[styles.eventDot, { backgroundColor: EVENT_COLORS[item.event.type] }]} />
              <View style={{ flex: 1 }}>
                <Typography style={{ fontWeight: '600', color: colors.text }}>{item.event.title}</Typography>
                <Typography variant="caption" style={{ color: colors.subtext }}>{format(item.date, 'dd MMM yyyy')}</Typography>
              </View>
              <Pressable onPress={() => handleAddToCalendar(item.event)} accessibilityRole="button">
                <Ionicons name="calendar-outline" size={18} color={colors.primary[500]} />
              </Pressable>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: { padding: 8 },
  calendarCard: { marginBottom: 12, padding: 12 },
  weekdayRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.285%', alignItems: 'center', paddingVertical: 6, minHeight: 44 },
  dayNum: { fontSize: 13 },
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  emptyCard: { alignItems: 'center', paddingVertical: 28 },
  eventRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  eventDot: { width: 10, height: 10, borderRadius: 5 },
});
