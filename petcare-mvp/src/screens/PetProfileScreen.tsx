import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Modal, Alert, Keyboard } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { colors, styling } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format, isAfter, parseISO } from 'date-fns';
import {
  FOOD_TARGET_GRAMS,
  FOOD_MAX_GRAMS,
  HEALTH_EVENTS_DISPLAY_LIMIT,
  WATER_DROPS_DISPLAY_LIMIT,
} from '../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'PetProfile'>;

export const PetProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { petId } = route.params;
  const pet = usePetStore((state) => state.pets.find((p) => p.id === petId));
  const addFoodLog = usePetStore((state) => state.addFoodLog);
  const addWaterLog = usePetStore((state) => state.addWaterLog);
  const deleteHealthEvent = usePetStore((state) => state.deleteHealthEvent);

  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [foodAmount, setFoodAmount] = useState('');

  React.useLayoutEffect(() => {
    if (!pet) return;
    navigation.setOptions({
      title: pet.name,
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('AddEditPet', { petId })}
          accessibilityLabel={`Edit ${pet.name}`}
          accessibilityRole="button"
        >
          <Typography style={{ color: colors.accent[500], fontWeight: '600' }}>Edit</Typography>
        </Pressable>
      ),
    });
  }, [navigation, petId, pet]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todaysFood = useMemo(
    () =>
      pet?.foodLogs
        .filter((log) => log.date.startsWith(today))
        .reduce((sum, log) => sum + log.amountGrams, 0) ?? 0,
    [pet?.foodLogs, today]
  );

  const todaysWater = useMemo(
    () =>
      pet?.waterLogs
        .filter((log) => log.date.startsWith(today))
        .reduce((sum, log) => sum + log.servings, 0) ?? 0,
    [pet?.waterLogs, today]
  );

  const foodProgress = useMemo(
    () => Math.min(todaysFood / FOOD_TARGET_GRAMS, 1),
    [todaysFood]
  );

  const lastFed = useMemo(() => {
    if (!pet || pet.foodLogs.length === 0) return 'Never';
    return format(parseISO(pet.foodLogs[pet.foodLogs.length - 1].date), 'h:mm a');
  }, [pet?.foodLogs]);

  const recentHealthEvents = useMemo(
    () => pet?.healthEvents.slice(0, HEALTH_EVENTS_DISPLAY_LIMIT) ?? [],
    [pet?.healthEvents]
  );

  const nextVaccine = useMemo(() => {
    if (!pet) return null;
    const upcoming = pet.healthEvents
      .filter((e) => isAfter(parseISO(e.date), new Date()))
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    return upcoming.find((e) => e.type === 'vaccine') ?? null;
  }, [pet?.healthEvents]);

  const handleAddFood = useCallback(() => {
    const amount = parseInt(foodAmount, 10);
    if (!isNaN(amount) && amount > 0 && amount <= FOOD_MAX_GRAMS) {
      addFoodLog(petId, { date: new Date().toISOString(), amountGrams: amount });
      Keyboard.dismiss();
      setFoodModalVisible(false);
      setFoodAmount('');
    }
  }, [foodAmount, petId, addFoodLog]);

  const handleAddWater = useCallback(() => {
    addWaterLog(petId, { date: new Date().toISOString(), servings: 1 });
  }, [petId, addWaterLog]);

  const handleCloseFoodModal = useCallback(() => {
    Keyboard.dismiss();
    setFoodModalVisible(false);
    setFoodAmount('');
  }, []);

  const handleLongPressEvent = useCallback(
    (eventId: string, title: string) => {
      Alert.alert('Delete Event', `Remove "${title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHealthEvent(petId, eventId),
        },
      ]);
    },
    [petId, deleteHealthEvent]
  );

  if (!pet) {
    return (
      <View style={styles.missingContainer}>
        <Typography variant="caption">Pet not found.</Typography>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Avatar uri={pet.avatarUri} size={96} style={styles.largeAvatar} />
        <Typography variant="heading" style={styles.petName}>{pet.name}</Typography>
        <Typography variant="caption" style={styles.petSubInfo}>
          {pet.breed}, {pet.weightKg} kg
        </Typography>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <MaterialCommunityIcons name="scale-bathroom" size={24} color={colors.primary[500]} />
          <Typography style={styles.statValue}>{pet.weightKg} kg</Typography>
          <Typography variant="caption">Weight</Typography>
        </Card>
        <Card style={styles.statCard}>
          <MaterialCommunityIcons name="bowl-outline" size={24} color={colors.accent[500]} />
          <Typography style={styles.statValue}>{lastFed}</Typography>
          <Typography variant="caption">Last Fed</Typography>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="medical-outline" size={24} color={colors.success} />
          <Typography style={styles.statValue}>
            {nextVaccine ? format(parseISO(nextVaccine.date), 'MMM d') : 'None'}
          </Typography>
          <Typography variant="caption">Next Vac</Typography>
        </Card>
      </View>

      <Card style={styles.sectionCard}>
        <Typography variant="heading" style={styles.sectionTitle}>Today's Nutrition</Typography>

        <View style={styles.nutritionRow}>
          <View style={styles.nutritionInfo}>
            <Typography style={styles.nutritionLabel}>Food</Typography>
            <Typography variant="caption">{todaysFood} / {FOOD_TARGET_GRAMS}g</Typography>
          </View>
          <ProgressBar progress={foodProgress} style={styles.progressBar} />
        </View>

        <View style={styles.nutritionRow}>
          <View style={styles.nutritionInfo}>
            <Typography style={styles.nutritionLabel}>Water</Typography>
            <Typography variant="caption">{todaysWater} Servings</Typography>
          </View>
          <View style={styles.waterDrops}>
            {Array.from({ length: Math.min(todaysWater, WATER_DROPS_DISPLAY_LIMIT) }).map((_, i) => (
              <Ionicons key={i} name="water" size={20} color={colors.primary[500]} style={{ marginRight: 4 }} />
            ))}
            {todaysWater > WATER_DROPS_DISPLAY_LIMIT && (
              <Typography variant="caption">+{todaysWater - WATER_DROPS_DISPLAY_LIMIT}</Typography>
            )}
            {todaysWater === 0 && <Typography variant="caption">None yet</Typography>}
          </View>
        </View>

        <View style={styles.actionRow}>
          <Button
            title="+ Food"
            variant="secondary"
            style={styles.actionBtn}
            onPress={() => setFoodModalVisible(true)}
            accessibilityLabel="Log food intake"
          />
          <View style={{ width: 16 }} />
          <Button
            title="+ Water"
            variant="secondary"
            style={styles.actionBtn}
            onPress={handleAddWater}
            accessibilityLabel="Log water intake"
          />
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Typography variant="heading" style={styles.sectionTitle}>Health Calendar</Typography>
          <Pressable
            onPress={() => navigation.navigate('AddEditHealthEvent', { petId })}
            accessibilityLabel="Add health event"
            accessibilityRole="button"
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.accent[500]} />
          </Pressable>
        </View>

        {pet.healthEvents.length === 0 ? (
          <Typography variant="caption" style={{ textAlign: 'center', marginVertical: 16 }}>
            No health events logged yet.
          </Typography>
        ) : (
          recentHealthEvents.map((event) => (
            <Pressable
              key={event.id}
              style={styles.eventItem}
              onPress={() => navigation.navigate('AddEditHealthEvent', { petId, eventId: event.id })}
              onLongPress={() => handleLongPressEvent(event.id, event.title)}
              accessibilityLabel={`${event.title}, ${format(parseISO(event.date), 'MMM d, yyyy')}. Long press to delete.`}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.eventIcon,
                  { backgroundColor: event.type === 'vaccine' ? colors.primary[100] : colors.neutral[100] },
                ]}
              >
                <Ionicons
                  name={event.type === 'vaccine' ? 'medical' : 'calendar'}
                  size={20}
                  color={event.type === 'vaccine' ? colors.primary[700] : colors.neutral[700]}
                />
              </View>
              <View style={styles.eventDetails}>
                <Typography style={{ fontWeight: '600' }}>{event.title}</Typography>
                <Typography variant="caption">{format(parseISO(event.date), 'MMM d, yyyy')}</Typography>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
            </Pressable>
          ))
        )}
      </Card>

      <View style={{ height: 40 }} />

      <Modal
        visible={foodModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseFoodModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typography variant="heading" style={{ marginBottom: 16 }}>Log Food</Typography>
            <TextInput
              label="Amount (grams)"
              keyboardType="numeric"
              value={foodAmount}
              onChangeText={setFoodAmount}
              placeholder="Amount in grams (e.g., 150)"
              autoFocus
              accessibilityLabel="Food amount in grams"
            />
            <View style={[styles.actionRow, { marginTop: 16 }]}>
              <Button
                title="Cancel"
                variant="secondary"
                style={styles.actionBtn}
                onPress={handleCloseFoodModal}
                accessibilityLabel="Cancel food log"
              />
              <View style={{ width: 16 }} />
              <Button
                title="Save"
                style={styles.actionBtn}
                onPress={handleAddFood}
                accessibilityLabel="Save food log"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  missingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', padding: styling.spacing[24] },
  largeAvatar: { marginBottom: styling.spacing[16] },
  petName: { fontSize: 32, marginBottom: styling.spacing[4] },
  petSubInfo: { fontSize: 16 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: styling.spacing[16],
    justifyContent: 'space-between',
    marginBottom: styling.spacing[16],
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    padding: styling.spacing[12],
    marginBottom: 0,
  },
  statValue: { fontWeight: 'bold', marginTop: 8, marginBottom: 2 },
  sectionCard: { marginHorizontal: styling.spacing[16], marginBottom: styling.spacing[16] },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: styling.spacing[16],
  },
  sectionTitle: { fontSize: 18, marginBottom: styling.spacing[16] },
  nutritionRow: { marginBottom: styling.spacing[16] },
  nutritionInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  nutritionLabel: { fontWeight: '600' },
  progressBar: { height: 8 },
  waterDrops: { flexDirection: 'row', alignItems: 'center' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: styling.spacing[8] },
  actionBtn: { flex: 1, paddingVertical: 12 },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventDetails: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    padding: 24,
    borderRadius: styling.borderRadius,
  },
});
