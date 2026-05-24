import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { subDays, parseISO } from 'date-fns';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Pet } from '../types/PetCare';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Nutrition'>;

const KCAL_PER_GRAM = 3.5;

const BREED_TIPS: Record<string, string> = {
  'golden retriever': 'Golden Retrievers tend to overeat. Monitor portions carefully.',
  'labrador': 'Labs are prone to obesity. Measure food precisely.',
  'labrador retriever': 'Labs are prone to obesity. Measure food precisely.',
  'german shepherd': 'GSDs need protein-rich food to support their active lifestyle.',
  'poodle': 'Poodles do well on grain-free diets with high protein.',
  'bulldog': 'Bulldogs have slow metabolism. Avoid high-calorie treats.',
  'french bulldog': 'French Bulldogs can be gassy — choose easily digestible foods.',
  'husky': 'Huskies are efficient metabolizers — feed less than you think.',
  'beagle': 'Beagles love to eat and gain weight easily. Stick to measured portions.',
  'chihuahua': 'Chihuahuas have tiny stomachs — feed small, frequent meals.',
  'dachshund': 'Dachshunds are prone to back issues; avoid obesity at all costs.',
  'persian': 'Persians benefit from hairball-control formulas.',
  'siamese': 'Siamese cats are active and may need more protein.',
  'maine coon': 'Maine Coons are large cats; ensure adequate calorie intake.',
  'default': 'Ensure fresh water is always available. Divide meals into 2 portions daily.',
};

function calcRER(weightKg: number): number {
  return 70 * Math.pow(weightKg, 0.75);
}

function calcDER(pet: Pet): number {
  const rer = calcRER(pet.weightKg);
  if (pet.type === 'cat') return rer * 1.2;
  return rer * 1.6;
}

function getBreedTip(breed: string): string {
  const key = breed.toLowerCase();
  for (const [k, v] of Object.entries(BREED_TIPS)) {
    if (k !== 'default' && key.includes(k)) return v;
  }
  return BREED_TIPS['default'];
}

export const NutritionScreen: React.FC<Props> = ({ route }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const { colors } = useTheme();
  const { t } = useTranslation();

  const dailyCalories = useMemo(() => (pet ? Math.round(calcDER(pet)) : 0), [pet]);
  const recommendedGrams = useMemo(() => Math.round(dailyCalories / KCAL_PER_GRAM), [dailyCalories]);

  const avgIntake7d = useMemo(() => {
    if (!pet) return 0;
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentLogs = pet.foodLogs.filter((l) => parseISO(l.date) >= sevenDaysAgo);
    if (recentLogs.length === 0) return 0;
    const total = recentLogs.reduce((sum, l) => sum + l.amountGrams, 0);
    return Math.round(total / 7);
  }, [pet?.foodLogs]);

  const intakeProgress = useMemo(() =>
    recommendedGrams > 0 ? Math.min(avgIntake7d / recommendedGrams, 1.5) : 0,
    [avgIntake7d, recommendedGrams]
  );

  const breedTip = useMemo(() => (pet ? getBreedTip(pet.breed) : ''), [pet?.breed]);

  const waterMin = useMemo(() => (pet ? Math.round(pet.weightKg * 30) : 0), [pet?.weightKg]);
  const waterMax = useMemo(() => (pet ? Math.round(pet.weightKg * 50) : 0), [pet?.weightKg]);

  if (!pet) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Calorie summary */}
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="flame-outline" size={24} color={colors.accent[500]} />
          <Typography variant="heading" style={[styles.cardTitle, { color: colors.text }]}>{t('dailyCalories')}</Typography>
        </View>
        <Typography style={{ fontSize: 40, fontWeight: 'bold', color: colors.primary[500], textAlign: 'center', marginVertical: 8 }}>
          {dailyCalories}
        </Typography>
        <Typography variant="caption" style={{ textAlign: 'center', color: colors.subtext }}>{t('calorieKcal')}</Typography>
      </Card>

      {/* Recommended food */}
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="restaurant-outline" size={24} color={colors.success} />
          <Typography variant="heading" style={[styles.cardTitle, { color: colors.text }]}>{t('recommendedFood')}</Typography>
        </View>
        <Typography style={{ fontSize: 28, fontWeight: '700', color: colors.text, textAlign: 'center', marginVertical: 8 }}>
          {recommendedGrams}g / day
        </Typography>
        <Typography variant="caption" style={{ textAlign: 'center', color: colors.subtext }}>
          At {KCAL_PER_GRAM} kcal/g average
        </Typography>
      </Card>

      {/* Avg intake vs recommended */}
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="bar-chart-outline" size={24} color={colors.primary[500]} />
          <Typography variant="heading" style={[styles.cardTitle, { color: colors.text }]}>{t('currentIntake')}</Typography>
        </View>
        <View style={styles.progressRow}>
          <Typography style={{ color: colors.text, fontWeight: '600' }}>{avgIntake7d}g</Typography>
          <Typography variant="caption" style={{ color: colors.subtext }}>/ {recommendedGrams}g recommended</Typography>
        </View>
        <ProgressBar
          progress={Math.min(intakeProgress / 1.5, 1)}
          color={avgIntake7d > recommendedGrams * 1.1 ? colors.error : avgIntake7d < recommendedGrams * 0.8 ? colors.warning : colors.success}
          style={{ marginTop: 8 }}
        />
        {avgIntake7d > recommendedGrams * 1.1 && (
          <Typography variant="caption" style={{ color: colors.error, marginTop: 6 }}>
            ⚠️ Intake is above recommended level
          </Typography>
        )}
        {avgIntake7d < recommendedGrams * 0.8 && avgIntake7d > 0 && (
          <Typography variant="caption" style={{ color: colors.warning, marginTop: 6 }}>
            ⚠️ Intake may be below recommended level
          </Typography>
        )}
        {avgIntake7d === 0 && (
          <Typography variant="caption" style={{ color: colors.subtext, marginTop: 6 }}>
            No food logs in the last 7 days
          </Typography>
        )}
      </Card>

      {/* Macronutrient breakdown (mock) */}
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="pie-chart-outline" size={24} color={colors.warning} />
          <Typography variant="heading" style={[styles.cardTitle, { color: colors.text }]}>Macronutrients (Recommended)</Typography>
        </View>
        {[
          { label: 'Protein', pct: 25, color: colors.primary[500] },
          { label: 'Fat', pct: 15, color: colors.warning },
          { label: 'Carbohydrates', pct: 60, color: colors.success },
        ].map((macro) => (
          <View key={macro.label} style={{ marginBottom: 10 }}>
            <View style={styles.progressRow}>
              <Typography style={{ color: colors.text, fontWeight: '500' }}>{macro.label}</Typography>
              <Typography variant="caption" style={{ color: colors.subtext }}>{macro.pct}%</Typography>
            </View>
            <ProgressBar progress={macro.pct / 100} color={macro.color} style={{ marginTop: 4 }} />
          </View>
        ))}
        <Typography variant="caption" style={{ color: colors.subtext, marginTop: 4 }}>
          * Based on general guidelines — consult your vet for breed-specific needs
        </Typography>
      </Card>

      {/* Water recommendation */}
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="water-outline" size={24} color={colors.primary[500]} />
          <Typography variant="heading" style={[styles.cardTitle, { color: colors.text }]}>Daily Water Intake</Typography>
        </View>
        <Typography style={{ fontSize: 24, fontWeight: '700', color: colors.primary[500], textAlign: 'center', marginVertical: 8 }}>
          {waterMin} – {waterMax} ml/day
        </Typography>
        <Typography variant="caption" style={{ textAlign: 'center', color: colors.subtext }}>
          30–50 ml per kg of body weight ({pet.weightKg} kg)
        </Typography>
      </Card>

      {/* Breed tip */}
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="bulb-outline" size={24} color={colors.accent[500]} />
          <Typography variant="heading" style={[styles.cardTitle, { color: colors.text }]}>{t('nutritionTip')}</Typography>
        </View>
        <Typography style={{ color: colors.text, lineHeight: 22 }}>{breedTip}</Typography>
        <Typography variant="caption" style={{ color: colors.subtext, marginTop: 6 }}>
          Breed: {pet.breed}
        </Typography>
      </Card>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  card: { marginBottom: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, marginLeft: 8 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
