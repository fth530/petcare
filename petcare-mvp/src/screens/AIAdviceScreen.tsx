import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { subDays, parseISO, differenceInDays } from 'date-fns';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Pet } from '../types/PetCare';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'AIAdvice'>;

type Priority = 'low' | 'medium' | 'high';

interface AdviceItem {
  id: string;
  icon: string;
  title: string;
  body: string;
  priority: Priority;
}

const BREED_TIPS: Record<string, string> = {
  'golden retriever': 'Golden Retrievers tend to overeat. Monitor portions carefully.',
  'labrador': 'Labs are prone to obesity. Measure food precisely.',
  'labrador retriever': 'Labs are prone to obesity. Measure food precisely.',
  'german shepherd': 'GSDs need protein-rich food to support their active lifestyle.',
  'poodle': 'Poodles do well on grain-free diets with high protein.',
  'bulldog': 'Bulldogs have slow metabolism. Avoid high-calorie treats.',
  'husky': 'Huskies are efficient metabolizers — feed less than you think.',
  'beagle': 'Beagles love to eat and gain weight easily. Stick to measured portions.',
  'default': 'Ensure fresh water is always available and divide meals into 2 portions daily.',
};

function getBreedTip(breed: string): string {
  const key = breed.toLowerCase();
  for (const [k, v] of Object.entries(BREED_TIPS)) {
    if (k !== 'default' && key.includes(k)) return v;
  }
  return BREED_TIPS['default'];
}

function generateAdvice(pet: Pet): AdviceItem[] {
  const items: AdviceItem[] = [];
  const now = new Date();

  // Weight advice
  if (pet.weightKg > 30) {
    items.push({
      id: 'weight-1',
      icon: 'scale-outline',
      title: 'Weight Management',
      body: 'Consider reducing portion size by 10% to help maintain a healthy weight.',
      priority: 'medium',
    });
  }

  // Activity advice
  const threeDaysAgo = subDays(now, 3);
  const recentActivity = pet.activityLogs.some((l) => parseISO(l.date) >= threeDaysAgo);
  if (!recentActivity) {
    items.push({
      id: 'activity-1',
      icon: 'walk-outline',
      title: 'Activity Reminder',
      body: "Your pet hasn't been active recently. Try a short walk or play session!",
      priority: 'high',
    });
  }

  // Vaccine reminders
  const upcomingVaccine = pet.healthEvents
    .filter((e): e is typeof e & { nextDueDate: string } => e.type === 'vaccine' && !!e.nextDueDate)
    .map((e) => ({ ...e, daysUntil: differenceInDays(parseISO(e.nextDueDate), now) }))
    .filter((e) => e.daysUntil >= 0 && e.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)[0];

  if (upcomingVaccine) {
    items.push({
      id: `vaccine-${upcomingVaccine.id}`,
      icon: 'medical-outline',
      title: 'Vaccine Due Soon',
      body: `${upcomingVaccine.title} is due in ${upcomingVaccine.daysUntil} days — schedule a vet visit.`,
      priority: upcomingVaccine.daysUntil <= 7 ? 'high' : 'medium',
    });
  }

  // Breed tip
  items.push({
    id: 'breed-tip',
    icon: 'paw-outline',
    title: `Tip for ${pet.breed}`,
    body: getBreedTip(pet.breed),
    priority: 'low',
  });

  // Grooming reminder
  const lastGroom = pet.groomingLogs.length > 0
    ? [...pet.groomingLogs].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())[0]
    : null;

  if (!lastGroom || differenceInDays(now, parseISO(lastGroom.date)) > 14) {
    items.push({
      id: 'groom-1',
      icon: 'cut-outline',
      title: 'Grooming Reminder',
      body: 'Regular grooming keeps your pet healthy and happy. Consider scheduling a session.',
      priority: 'low',
    });
  }

  // Hydration check
  const today = now.toISOString().split('T')[0];
  const todayWater = pet.waterLogs.filter((l) => l.date.startsWith(today)).reduce((s, l) => s + l.servings, 0);
  if (todayWater < pet.waterTargetServings / 2) {
    items.push({
      id: 'water-1',
      icon: 'water-outline',
      title: 'Hydration Alert',
      body: `${pet.name} has had less than half of their daily water target. Make sure fresh water is available.`,
      priority: 'medium',
    });
  }

  return items;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const AIAdviceScreen: React.FC<Props> = ({ route }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const advice = useMemo(() => (pet ? generateAdvice(pet) : []), [pet]);

  if (!pet) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Coming soon banner */}
      <View style={[styles.banner, { backgroundColor: colors.primary[100], borderColor: colors.primary[500] }]}>
        <Ionicons name="sparkles-outline" size={20} color={colors.primary[500]} />
        <Typography style={{ color: colors.primary[700], marginLeft: 8, flex: 1, fontSize: 13 }}>
          {t('aiComingSoon')}
        </Typography>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Typography variant="caption" style={{ color: colors.subtext, marginTop: 16 }}>{t('aiLoading')}</Typography>
        </View>
      ) : (
        <>
          <Typography variant="caption" style={[styles.subtitle, { color: colors.subtext }]}>
            {advice.length} recommendations for {pet.name}
          </Typography>

          {advice.map((item) => (
            <Card key={item.id} style={[styles.adviceCard, { backgroundColor: colors.card }]}>
              <View style={styles.adviceHeader}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primary[100] }]}>
                  <Ionicons name={item.icon as any} size={22} color={colors.primary[500]} />
                </View>
                <View style={styles.adviceTitleRow}>
                  <Typography style={{ fontWeight: '700', color: colors.text, flex: 1 }}>{item.title}</Typography>
                  <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[item.priority] + '22' }]}>
                    <Typography style={{ fontSize: 11, fontWeight: '600', color: PRIORITY_COLORS[item.priority] }}>
                      {PRIORITY_LABELS[item.priority]}
                    </Typography>
                  </View>
                </View>
              </View>
              <Typography style={{ color: colors.subtext, lineHeight: 20, marginTop: 8 }}>{item.body}</Typography>
            </Card>
          ))}
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  banner: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: styling.borderRadius,
    borderWidth: 1, marginBottom: 16,
  },
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  subtitle: { marginBottom: 12 },
  adviceCard: { marginBottom: 12, padding: 14 },
  adviceHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  iconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  adviceTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 8 },
});
