import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, ListRenderItem } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { colors, styling } from '../theme';
import * as Haptics from 'expo-haptics';
import { Pet } from '../types/PetCare';

type Props = NativeStackScreenProps<RootStackParamList, 'PetList'>;

export const PetListScreen: React.FC<Props> = ({ navigation }) => {
  const pets = usePetStore(state => state.pets);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            navigation.navigate('AddEditPet', {});
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          accessibilityLabel="Add new pet"
          accessibilityRole="button"
        >
          <Ionicons name="add-circle-outline" size={28} color={colors.accent[500]} />
        </Pressable>
      ),
    });
  }, [navigation]);

  const renderItem: ListRenderItem<Pet> = useCallback(({ item, index }) => (
    <Animated.View
      entering={FadeIn.delay(index * 100).duration(400)}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          navigation.navigate('PetProfile', { petId: item.id });
        }}
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
        accessibilityLabel={`View ${item.name}, ${item.breed}`}
        accessibilityRole="button"
      >
        <Card style={styles.petCard}>
          <Avatar uri={item.avatarUri} size={64} style={styles.avatar} />
          <View style={styles.petInfo}>
            <Typography variant="heading" style={styles.petName}>{item.name}</Typography>
            <Typography variant="caption">{item.breed}</Typography>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.neutral[300]} />
        </Card>
      </Pressable>
    </Animated.View>
  ), [navigation]);

  if (pets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="paw" size={120} color={colors.neutral[200]} style={styles.emptyIcon} />
        <Typography variant="heading" style={styles.emptyTitle}>Welcome to PetCare!</Typography>
        <Typography variant="body" style={styles.emptySubtitle}>Let's add your first furry friend to get started.</Typography>
        <Button
          title="Add Your First Pet"
          onPress={() => navigation.navigate('AddEditPet', {})}
          style={styles.emptyButton}
          accessibilityLabel="Add your first pet"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pets}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: styling.spacing[16],
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: styling.spacing[16],
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: styling.spacing[32],
  },
  emptyIcon: {
    marginBottom: styling.spacing[24],
  },
  emptyTitle: {
    fontSize: 24,
    marginBottom: styling.spacing[8],
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: colors.neutral[500],
    marginBottom: styling.spacing[32],
  },
  emptyButton: {
    width: '100%',
  },
});
