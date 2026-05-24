import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { subDays, parseISO, format, startOfDay } from 'date-fns';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { LineChart } from '../components/LineChart';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Statistics'>;
type Range = 7 | 30;

export const StatisticsScreen: React.FC<Props> = ({ route }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [range, setRange] = useState<Range>(7);

  const chartWidth = width - 32;

  const computeStats = useMemo(() => {
    if (!pet) return null;
    const cutoff = subDays(new Date(), range);
    const days: { date: string; food: number; water: number }[] = [];

    for (let i = range - 1; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const prefix = format(day, 'yyyy-MM-dd');
      const food = pet.foodLogs
        .filter((l) => l.date.startsWith(prefix))
        .reduce((s, l) => s + l.amountGrams, 0);
      const water = pet.waterLogs
        .filter((l) => l.date.startsWith(prefix))
        .reduce((s, l) => s + l.servings, 0);
      days.push({ date: prefix, food, water });
    }

    const activeFoodDays = days.filter((d) => d.food > 0);
    const activeWaterDays = days.filter((d) => d.water > 0);
    const avgFood = activeFoodDays.length ? Math.round(activeFoodDays.reduce((s, d) => s + d.food, 0) / activeFoodDays.length) : 0;
    const avgWater = activeWaterDays.length ? (activeWaterDays.reduce((s, d) => s + d.water, 0) / activeWaterDays.length).toFixed(1) : 0;

    const foodChartData = days.map((d, i) => ({ x: i, y: d.food, label: format(parseISO(d.date), 'MM/dd') }));
    const waterChartData = days.map((d, i) => ({ x: i, y: d.water, label: format(parseISO(d.date), 'MM/dd') }));

    const healthEvents = pet.healthEvents.filter((e) => parseISO(e.date) >= cutoff).length;
    const groomingCount = (pet.groomingLogs ?? []).filter((g) => parseISO(g.date) >= cutoff).length;

    return { days, avgFood, avgWater, foodChartData, waterChartData, healthEvents, groomingCount };
  }, [pet, range]);

  if (!pet || !computeStats) return null;
  const { avgFood, avgWater, foodChartData, waterChartData, healthEvents, groomingCount } = computeStats;

  const rangeLabel = range === 7 ? t('last7Days') : t('last30Days');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Range toggle */}
      <View style={styles.rangeRow}>
        {([7, 30] as Range[]).map((r) => (
          <Pressable key={r} onPress={() => setRange(r)}
            style={[styles.rangeBtn, { borderColor: range === r ? colors.primary[500] : colors.border, backgroundColor: range === r ? colors.primary[100] : colors.card }]}
            accessibilityRole="button">
            <Typography style={{ color: range === r ? colors.primary[700] : colors.subtext, fontWeight: range === r ? '600' : '400', fontSize: 13 }}>
              {r === 7 ? t('last7Days') : t('last30Days')}
            </Typography>
          </Pressable>
        ))}
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        {[
          { label: t('avgFood'), value: `${avgFood}g`, color: colors.accent[500] },
          { label: t('avgWater'), value: `${avgWater} srv`, color: colors.primary[500] },
          { label: t('totalEvents'), value: String(healthEvents), color: colors.success },
          { label: t('totalGrooming'), value: String(groomingCount), color: colors.warning },
        ].map((s, i) => (
          <Card key={i} style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Typography style={{ fontSize: 20, fontWeight: 'bold', color: s.color }}>{s.value}</Typography>
            <Typography variant="caption" style={{ color: colors.subtext, textAlign: 'center', marginTop: 4 }}>{s.label}</Typography>
          </Card>
        ))}
      </View>

      {/* Food chart */}
      <Card style={[styles.chartCard, { backgroundColor: colors.card }]}>
        <Typography variant="heading" style={[styles.chartTitle, { color: colors.text }]}>{t('food')} — {rangeLabel}</Typography>
        <LineChart data={foodChartData} width={chartWidth - 32} unit="g" color={colors.accent[500]} />
      </Card>

      {/* Water chart */}
      <Card style={[styles.chartCard, { backgroundColor: colors.card }]}>
        <Typography variant="heading" style={[styles.chartTitle, { color: colors.text }]}>{t('water')} — {rangeLabel}</Typography>
        <LineChart data={waterChartData} width={chartWidth - 32} unit="" color={colors.primary[500]} />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  rangeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  rangeBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: { flex: 1, alignItems: 'center', marginBottom: 0, padding: styling.spacing[12] },
  chartCard: { marginBottom: 16 },
  chartTitle: { fontSize: 15, marginBottom: 12 },
});
