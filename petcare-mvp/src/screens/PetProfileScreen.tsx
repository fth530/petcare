import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Modal, Alert, Keyboard, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format, isAfter, parseISO } from 'date-fns';
import { FOOD_MAX_GRAMS, HEALTH_EVENTS_DISPLAY_LIMIT, WATER_DROPS_DISPLAY_LIMIT } from '../constants';
import { formatAge } from '../utils/dateUtils';
import { shareHealthSummary } from '../services/ExportService';

type Props = NativeStackScreenProps<RootStackParamList, 'PetProfile'>;

export const PetProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const addFoodLog = usePetStore((s) => s.addFoodLog);
  const addWaterLog = usePetStore((s) => s.addWaterLog);
  const addWeightLog = usePetStore((s) => s.addWeightLog);
  const deleteHealthEvent = usePetStore((s) => s.deleteHealthEvent);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [foodAmount, setFoodAmount] = useState('');
  const [weightInput, setWeightInput] = useState('');

  React.useLayoutEffect(() => {
    if (!pet) return;
    navigation.setOptions({
      title: pet.name,
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={() => shareHealthSummary(pet).catch(() => {})} accessibilityRole="button" accessibilityLabel={t('shareProfile')}>
            <Ionicons name="share-outline" size={22} color={colors.accent[500]} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('AddEditPet', { petId })} accessibilityRole="button" accessibilityLabel={t('edit')}>
            <Typography style={{ color: colors.accent[500], fontWeight: '600' }}>{t('edit')}</Typography>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, petId, pet, colors, t]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const foodTarget = pet?.foodTargetGrams ?? 300;
  const waterTarget = pet?.waterTargetServings ?? 4;

  const todaysFood = useMemo(() =>
    pet?.foodLogs.filter((l) => l.date.startsWith(today)).reduce((s, l) => s + l.amountGrams, 0) ?? 0,
    [pet?.foodLogs, today]);
  const todaysWater = useMemo(() =>
    pet?.waterLogs.filter((l) => l.date.startsWith(today)).reduce((s, l) => s + l.servings, 0) ?? 0,
    [pet?.waterLogs, today]);
  const foodProgress = useMemo(() => Math.min(todaysFood / foodTarget, 1), [todaysFood, foodTarget]);
  const waterProgress = useMemo(() => Math.min(todaysWater / waterTarget, 1), [todaysWater, waterTarget]);

  const lastFed = useMemo(() => {
    if (!pet || pet.foodLogs.length === 0) return t('noneFed');
    return format(parseISO(pet.foodLogs[pet.foodLogs.length - 1].date), 'h:mm a');
  }, [pet?.foodLogs, t]);

  const recentEvents = useMemo(() =>
    pet?.healthEvents.slice(0, HEALTH_EVENTS_DISPLAY_LIMIT) ?? [], [pet?.healthEvents]);

  const nextVaccine = useMemo(() => {
    if (!pet) return null;
    return pet.healthEvents
      .filter((e) => e.type === 'vaccine' && isFuture(parseISO(e.date)))
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())[0] ?? null;
    function isFuture(d: Date) { return isAfter(d, new Date()); }
  }, [pet?.healthEvents]);

  const lastGrooming = useMemo(() => {
    const logs = pet?.groomingLogs ?? [];
    if (!logs.length) return null;
    return [...logs].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())[0];
  }, [pet?.groomingLogs]);

  const handleAddFood = useCallback(() => {
    const amount = parseInt(foodAmount, 10);
    if (!isNaN(amount) && amount > 0 && amount <= FOOD_MAX_GRAMS) {
      addFoodLog(petId, { date: new Date().toISOString(), amountGrams: amount });
      Keyboard.dismiss(); setFoodModalVisible(false); setFoodAmount('');
    }
  }, [foodAmount, petId, addFoodLog]);

  const handleAddWeight = useCallback(() => {
    const kg = parseFloat(weightInput);
    if (!isNaN(kg) && kg > 0 && kg < 1000) {
      addWeightLog(petId, { date: new Date().toISOString(), weightKg: kg });
      Keyboard.dismiss(); setWeightModalVisible(false); setWeightInput('');
    }
  }, [weightInput, petId, addWeightLog]);

  const handleAddWater = useCallback(() => {
    addWaterLog(petId, { date: new Date().toISOString(), servings: 1 });
  }, [petId, addWaterLog]);

  const handleLongPressEvent = useCallback((eventId: string, title: string) => {
    Alert.alert(t('deleteEvent'), `Remove "${title}"?`, [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteHealthEvent(petId, eventId) },
    ]);
  }, [petId, deleteHealthEvent, t]);

  const callVet = useCallback(() => {
    if (pet?.vet?.phone) Linking.openURL(`tel:${pet.vet.phone}`);
  }, [pet?.vet?.phone]);

  if (!pet) {
    return (
      <View style={[styles.missingContainer, { backgroundColor: colors.background }]}>
        <Typography variant="caption" style={{ color: colors.subtext }}>Pet not found.</Typography>
      </View>
    );
  }

  const age = pet.dateOfBirth ? formatAge(pet.dateOfBirth, t) : null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar uri={pet.avatarUri} size={96} style={styles.largeAvatar} />
        <Typography variant="heading" style={[styles.petName, { color: colors.text }]}>{pet.name}</Typography>
        <Typography variant="caption" style={{ color: colors.subtext, fontSize: 15 }}>{pet.breed}, {pet.weightKg} kg</Typography>
        {age && <Typography variant="caption" style={{ color: colors.primary[500], marginTop: 4 }}>{t('age')}: {age}</Typography>}
      </View>

      {/* Stat cards */}
      <View style={styles.statsRow}>
        {[
          { icon: 'scale-bathroom', color: colors.primary[500], value: `${pet.weightKg} kg`, label: t('weightLabel') },
          { icon: 'bowl-outline', color: colors.accent[500], value: lastFed, label: t('lastFed') },
          { icon: null, value: nextVaccine ? format(parseISO(nextVaccine.date), 'MMM d') : 'None', label: t('nextVaccine'), isIonicons: true },
        ].map((s, i) => (
          <Card key={i} style={[styles.statCard, { backgroundColor: colors.card }]}>
            {s.isIonicons
              ? <Ionicons name="medical-outline" size={24} color={colors.success} />
              : <MaterialCommunityIcons name={s.icon as any} size={24} color={s.color} />}
            <Typography style={[styles.statValue, { color: colors.text }]}>{s.value}</Typography>
            <Typography variant="caption" style={{ color: colors.subtext }}>{s.label}</Typography>
          </Card>
        ))}
      </View>

      {/* Nutrition */}
      <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        <Typography variant="heading" style={[styles.sectionTitle, { color: colors.text }]}>{t('todaysNutrition')}</Typography>
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionInfo}>
            <Typography style={[styles.nutritionLabel, { color: colors.text }]}>{t('food')}</Typography>
            <Typography variant="caption" style={{ color: colors.subtext }}>{todaysFood} / {foodTarget}g</Typography>
          </View>
          <ProgressBar progress={foodProgress} style={styles.progressBar} />
        </View>
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionInfo}>
            <Typography style={[styles.nutritionLabel, { color: colors.text }]}>{t('water')}</Typography>
            <Typography variant="caption" style={{ color: colors.subtext }}>{todaysWater} / {waterTarget} {t('servings')}</Typography>
          </View>
          <ProgressBar progress={waterProgress} style={styles.progressBar} color={colors.primary[500]} />
        </View>
        <View style={styles.actionRow}>
          <Button title={`+ ${t('food')}`} variant="secondary" style={styles.actionBtn} onPress={() => setFoodModalVisible(true)} accessibilityLabel={t('logFood')} />
          <View style={{ width: 12 }} />
          <Button title={`+ ${t('water')}`} variant="secondary" style={styles.actionBtn} onPress={handleAddWater} accessibilityLabel={t('water')} />
        </View>
      </Card>

      {/* Quick actions row 1 */}
      <View style={[styles.quickRow, { paddingHorizontal: styling.spacing[16] }]}>
        {[
          { icon: 'trending-up-outline', color: colors.primary[500], label: t('weightHistory'), screen: 'WeightHistory' },
          { icon: 'cut-outline', color: colors.accent[500], label: t('grooming'), screen: 'Grooming' },
          { icon: 'bar-chart-outline', color: colors.success, label: t('stats'), screen: 'Statistics' },
          { icon: 'calendar-outline', color: colors.warning, label: t('calendar'), screen: 'Calendar' },
        ].map((item) => (
          <Pressable key={item.screen} style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate(item.screen as any, { petId })} accessibilityRole="button">
            <Ionicons name={item.icon as any} size={22} color={item.color} />
            <Typography variant="caption" style={{ color: colors.subtext, marginTop: 4, textAlign: 'center' }}>{item.label}</Typography>
          </Pressable>
        ))}
      </View>

      {/* Quick actions row 2 */}
      <View style={[styles.quickRow, { paddingHorizontal: styling.spacing[16] }]}>
        {[
          { icon: 'medkit-outline', color: colors.primary[500], label: t('medications'), screen: 'Medications' },
          { icon: 'walk-outline', color: '#10b981', label: t('activities'), screen: 'ActivityLog' },
          { icon: 'wallet-outline', color: '#f59e0b', label: t('budget'), screen: 'Budget' },
          { icon: 'images-outline', color: '#3b82f6', label: t('photos'), screen: 'PhotoAlbum' },
        ].map((item) => (
          <Pressable key={item.screen} style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate(item.screen as any, { petId })} accessibilityRole="button">
            <Ionicons name={item.icon as any} size={22} color={item.color} />
            <Typography variant="caption" style={{ color: colors.subtext, marginTop: 4, textAlign: 'center' }}>{item.label}</Typography>
          </Pressable>
        ))}
      </View>

      {/* Passport & placeholders row */}
      <View style={[styles.quickRow, { paddingHorizontal: styling.spacing[16] }]}>
        {[
          { icon: 'id-card-outline', color: colors.primary[700], label: t('petPassport'), screen: 'PetPassport' },
          { icon: 'map-outline', color: colors.neutral[300], label: t('vetMap'), screen: 'VetMap', noParam: true },
          { icon: 'shield-outline', color: colors.neutral[300], label: t('insurance'), screen: 'Insurance', noParam: true },
          pet.vet?.phone ? { icon: 'call-outline', color: colors.success, label: t('callVet'), screen: 'callVet', isCall: true } : null,
        ].filter(Boolean).map((item: any) => (
          <Pressable key={item.screen} style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={item.isCall ? callVet : () => navigation.navigate(item.screen as any, item.noParam ? undefined : { petId })}
            accessibilityRole="button">
            <Ionicons name={item.icon as any} size={22} color={item.color} />
            <Typography variant="caption" style={{ color: colors.subtext, marginTop: 4, textAlign: 'center' }}>{item.label}</Typography>
          </Pressable>
        ))}
      </View>

      {/* Weight log quick entry */}
      <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Typography variant="heading" style={[styles.sectionTitle, { color: colors.text }]}>{t('weightHistory')}</Typography>
          <Pressable onPress={() => navigation.navigate('WeightHistory', { petId })} accessibilityRole="button">
            <Typography style={{ color: colors.accent[500], fontSize: 13 }}>View all</Typography>
          </Pressable>
        </View>
        <Button title={t('logWeightBtn')} variant="secondary" onPress={() => setWeightModalVisible(true)} accessibilityLabel={t('weightLog')} />
      </Card>

      {/* Vet info */}
      {(pet.vet?.name || pet.vet?.clinic) ? (
        <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <Typography variant="heading" style={[styles.sectionTitle, { color: colors.text }]}>{t('vetInfo')}</Typography>
          {pet.vet.name ? <Typography style={{ color: colors.text, fontWeight: '600' }}>{pet.vet.name}</Typography> : null}
          {pet.vet.clinic ? <Typography variant="caption" style={{ color: colors.subtext }}>{pet.vet.clinic}</Typography> : null}
          {pet.vet.phone ? (
            <Pressable onPress={callVet} style={styles.callRow} accessibilityRole="button">
              <Ionicons name="call-outline" size={16} color={colors.primary[500]} />
              <Typography style={{ color: colors.primary[500], marginLeft: 6 }}>{pet.vet.phone}</Typography>
            </Pressable>
          ) : null}
        </Card>
      ) : null}

      {/* Health Calendar */}
      <Card style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Typography variant="heading" style={[styles.sectionTitle, { color: colors.text }]}>{t('healthCalendar')}</Typography>
          <Pressable onPress={() => navigation.navigate('AddEditHealthEvent', { petId })} accessibilityRole="button" accessibilityLabel={t('addHealthEvent')}>
            <Ionicons name="add-circle-outline" size={24} color={colors.accent[500]} />
          </Pressable>
        </View>
        {pet.healthEvents.length === 0 ? (
          <Typography variant="caption" style={{ textAlign: 'center', marginVertical: 16, color: colors.subtext }}>{t('noEvents')}</Typography>
        ) : recentEvents.map((event) => (
          <Pressable key={event.id} style={[styles.eventItem, { borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('AddEditHealthEvent', { petId, eventId: event.id })}
            onLongPress={() => handleLongPressEvent(event.id, event.title)}
            accessibilityRole="button"
            accessibilityLabel={`${event.title}, ${format(parseISO(event.date), 'MMM d, yyyy')}`}>
            <View style={[styles.eventIcon, { backgroundColor: event.type === 'vaccine' ? colors.primary[100] : colors.neutral[100] }]}>
              <Ionicons name={event.type === 'vaccine' ? 'medical' : 'calendar'} size={20} color={event.type === 'vaccine' ? colors.primary[700] : colors.neutral[500]} />
            </View>
            <View style={styles.eventDetails}>
              <Typography style={{ fontWeight: '600', color: colors.text }}>{event.title}</Typography>
              <Typography variant="caption" style={{ color: colors.subtext }}>{format(parseISO(event.date), 'MMM d, yyyy')}</Typography>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
          </Pressable>
        ))}
      </Card>

      <View style={{ height: 40 }} />

      {/* Food modal */}
      <Modal visible={foodModalVisible} transparent animationType="fade" onRequestClose={() => { Keyboard.dismiss(); setFoodModalVisible(false); setFoodAmount(''); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Typography variant="heading" style={{ marginBottom: 16, color: colors.text }}>{t('logFood')}</Typography>
            <TextInput label={t('amountGrams')} keyboardType="numeric" value={foodAmount} onChangeText={setFoodAmount} placeholder="e.g., 150" autoFocus accessibilityLabel={t('amountGrams')} />
            <View style={[styles.actionRow, { marginTop: 16 }]}>
              <Button title={t('cancel')} variant="secondary" style={styles.actionBtn} onPress={() => { Keyboard.dismiss(); setFoodModalVisible(false); setFoodAmount(''); }} />
              <View style={{ width: 12 }} />
              <Button title={t('save')} style={styles.actionBtn} onPress={handleAddFood} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Weight modal */}
      <Modal visible={weightModalVisible} transparent animationType="fade" onRequestClose={() => { Keyboard.dismiss(); setWeightModalVisible(false); setWeightInput(''); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Typography variant="heading" style={{ marginBottom: 16, color: colors.text }}>{t('weightLog')}</Typography>
            <TextInput label={t('weightKg')} keyboardType="numeric" value={weightInput} onChangeText={setWeightInput} placeholder="e.g., 32.5" autoFocus />
            <View style={[styles.actionRow, { marginTop: 16 }]}>
              <Button title={t('cancel')} variant="secondary" style={styles.actionBtn} onPress={() => { Keyboard.dismiss(); setWeightModalVisible(false); setWeightInput(''); }} />
              <View style={{ width: 12 }} />
              <Button title={t('save')} style={styles.actionBtn} onPress={handleAddWeight} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  missingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', padding: styling.spacing[24] },
  largeAvatar: { marginBottom: styling.spacing[16] },
  petName: { fontSize: 30, marginBottom: styling.spacing[4] },
  statsRow: { flexDirection: 'row', paddingHorizontal: styling.spacing[16], justifyContent: 'space-between', marginBottom: styling.spacing[16] },
  statCard: { flex: 1, marginHorizontal: 4, alignItems: 'center', padding: styling.spacing[12], marginBottom: 0 },
  statValue: { fontWeight: 'bold', marginTop: 8, marginBottom: 2 },
  sectionCard: { marginHorizontal: styling.spacing[16], marginBottom: styling.spacing[16] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: styling.spacing[12] },
  sectionTitle: { fontSize: 17, marginBottom: styling.spacing[12] },
  nutritionRow: { marginBottom: styling.spacing[12] },
  nutritionInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  nutritionLabel: { fontWeight: '600' },
  progressBar: { height: 8 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: styling.spacing[8] },
  actionBtn: { flex: 1, paddingVertical: 12 },
  quickRow: { flexDirection: 'row', marginBottom: styling.spacing[16], gap: 8 },
  quickBtn: { flex: 1, alignItems: 'center', padding: styling.spacing[12], borderRadius: styling.borderRadius, borderWidth: 1 },
  callRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  eventItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  eventIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  eventDetails: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { padding: 24, borderRadius: styling.borderRadius },
});
