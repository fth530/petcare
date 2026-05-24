import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, ListRenderItem, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import * as Haptics from 'expo-haptics';
import { Pet } from '../types/PetCare';
import { formatAge } from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'PetList'>;
type Filter = 'all' | 'dog' | 'cat' | 'other';

export const PetListScreen: React.FC<Props> = ({ navigation }) => {
  const pets = usePetStore(state => state.pets);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: t('myPets'),
      headerRight: () => (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            navigation.navigate('AddEditPet', {});
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginRight: 4 })}
          accessibilityLabel={t('addPet')}
          accessibilityRole="button"
        >
          <Ionicons name="add-circle-outline" size={28} color={colors.accent[500]} />
        </Pressable>
      ),
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginLeft: 4 })}
          accessibilityLabel={t('settings')}
          accessibilityRole="button"
        >
          <Ionicons name="settings-outline" size={24} color={colors.subtext} />
        </Pressable>
      ),
    });
  }, [navigation, colors, t]);

  const filtered = useMemo(() => {
    let list = pets;
    if (filter !== 'all') list = list.filter((p) => p.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q)
      );
    }
    return list;
  }, [pets, filter, search]);

  const renderItem: ListRenderItem<Pet> = useCallback(({ item, index }) => (
    <Animated.View entering={FadeIn.delay(index * 80).duration(350)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          navigation.navigate('PetProfile', { petId: item.id });
        }}
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
        accessibilityLabel={`${t('edit')} ${item.name}`}
        accessibilityRole="button"
      >
        <Card style={[styles.petCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Avatar uri={item.avatarUri} size={64} style={styles.avatar} />
          <View style={styles.petInfo}>
            <Typography variant="heading" style={[styles.petName, { color: colors.text }]}>{item.name}</Typography>
            <Typography variant="caption" style={{ color: colors.subtext }}>{item.breed}</Typography>
            {item.dateOfBirth ? (
              <Typography variant="caption" style={{ color: colors.subtext, marginTop: 2 }}>
                {formatAge(item.dateOfBirth, t)}
              </Typography>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.neutral[300]} />
        </Card>
      </Pressable>
    </Animated.View>
  ), [navigation, colors, t]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('filterAll') },
    { key: 'dog', label: t('dog') },
    { key: 'cat', label: t('cat') },
    { key: 'other', label: t('other') },
  ];

  if (pets.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="paw" size={120} color={colors.neutral[200]} style={styles.emptyIcon} />
        <Typography variant="heading" style={[styles.emptyTitle, { color: colors.text }]}>{t('welcome')}</Typography>
        <Typography variant="body" style={[styles.emptySubtitle, { color: colors.subtext }]}>{t('welcomeSubtitle')}</Typography>
        <Button title={t('addFirstPet')} onPress={() => navigation.navigate('AddEditPet', {})} style={styles.emptyButton} accessibilityLabel={t('addFirstPet')} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.subtext} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('searchPets')}
          placeholderTextColor={colors.subtext}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel={t('searchPets')}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel={t('close')}>
            <Ionicons name="close-circle" size={18} color={colors.subtext} />
          </Pressable>
        )}
      </View>

      {/* Compare button */}
      {pets.length >= 2 && (
        <Pressable
          onPress={() => navigation.navigate('Compare')}
          style={[styles.compareBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel={t('compareTitle')}
        >
          <Typography style={{ color: colors.primary[500], fontWeight: '600', fontSize: 14 }}>⚖️ {t('compareTitle')}</Typography>
        </Pressable>
      )}

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {filters.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            style={[
              styles.chip,
              { borderColor: filter === key ? colors.primary[500] : colors.border,
                backgroundColor: filter === key ? colors.primary[100] : colors.card },
            ]}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <Typography style={{ fontSize: 13, color: filter === key ? colors.primary[700] : colors.subtext, fontWeight: filter === key ? '600' : '400' }}>
              {label}
            </Typography>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.noResults}>
            <Typography variant="caption" style={{ color: colors.subtext, textAlign: 'center' }}>No pets match your search.</Typography>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: styling.spacing[16] },
  petCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  avatar: { marginRight: styling.spacing[16] },
  petInfo: { flex: 1 },
  petName: { fontSize: 17, marginBottom: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: styling.spacing[32] },
  emptyIcon: { marginBottom: styling.spacing[24] },
  emptyTitle: { fontSize: 24, marginBottom: styling.spacing[8], textAlign: 'center' },
  emptySubtitle: { textAlign: 'center', marginBottom: styling.spacing[32] },
  emptyButton: { width: '100%' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: styling.spacing[16], marginTop: styling.spacing[12],
    borderRadius: styling.borderRadius, borderWidth: 1,
    paddingHorizontal: styling.spacing[12], paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  filterRow: { flexDirection: 'row', paddingHorizontal: styling.spacing[16], marginTop: styling.spacing[8], gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  noResults: { alignItems: 'center', marginTop: 40 },
  compareBtn: {
    marginHorizontal: styling.spacing[16], marginTop: 8,
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: styling.borderRadius, borderWidth: 1,
    alignItems: 'center',
  },
});
