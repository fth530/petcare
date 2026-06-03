import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { PetListScreen } from '../screens/PetListScreen';
import { PetProfileScreen } from '../screens/PetProfileScreen';
import { AddEditPetScreen } from '../screens/AddEditPetScreen';
import { AddEditHealthEventScreen } from '../screens/AddEditHealthEventScreen';
import { WeightHistoryScreen } from '../screens/WeightHistoryScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { GroomingScreen } from '../screens/GroomingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { MedicationsScreen } from '../screens/MedicationsScreen';
import { ActivityLogScreen } from '../screens/ActivityLogScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import { PhotoAlbumScreen } from '../screens/PhotoAlbumScreen';
import { PetPassportScreen } from '../screens/PetPassportScreen';
import { VetMapScreen } from '../screens/VetMapScreen';
import { InsuranceScreen } from '../screens/InsuranceScreen';
import { CareScheduleScreen } from '../screens/CareScheduleScreen';
import { NutritionScreen } from '../screens/NutritionScreen';
import { CompareScreen } from '../screens/CompareScreen';
import { AIAdviceScreen } from '../screens/AIAdviceScreen';
import { SymptomsScreen } from '../screens/SymptomsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useTheme } from '../context/ThemeContext';
import { useOnboardingStore } from '../store/onboardingStore';

export type RootStackParamList = {
  Onboarding: undefined;
  PetList: undefined;
  PetProfile: { petId: string };
  AddEditPet: { petId?: string };
  AddEditHealthEvent: { petId: string; eventId?: string };
  WeightHistory: { petId: string };
  Statistics: { petId: string };
  Grooming: { petId: string };
  Settings: undefined;
  Calendar: { petId: string };
  Medications: { petId: string };
  ActivityLog: { petId: string };
  Budget: { petId: string };
  PhotoAlbum: { petId: string };
  PetPassport: { petId: string };
  VetMap: undefined;
  Insurance: undefined;
  CareSchedule: { petId: string };
  Nutrition: { petId: string };
  Compare: undefined;
  AIAdvice: { petId: string };
  Symptoms: { petId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['petcare://'],
  config: {
    screens: {
      PetList: 'pets',
      PetProfile: 'pet/:petId',
      Settings: 'settings',
    },
  },
};

export const RootNavigator = () => {
  const { colors } = useTheme();
  const hasCompletedOnboarding = useOnboardingStore((s) => s.hasCompletedOnboarding);

  const mainScreenOptions = {
    headerStyle: { backgroundColor: colors.background },
    headerShadowVisible: false,
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: 'bold' as const, color: colors.text },
    contentStyle: { backgroundColor: colors.background },
    animation: 'fade_from_bottom' as const,
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        {!hasCompletedOnboarding ? (
          // ── Onboarding stack ───────────────────────────────────────────────
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{
              headerShown: false,
              animation: 'fade',
              animationTypeForReplace: 'push',
            }}
          />
        ) : (
          // ── Main app stack ─────────────────────────────────────────────────
          <>
            <Stack.Screen
              name="PetList"
              component={PetListScreen}
              options={{ ...mainScreenOptions, title: 'My Pets' }}
            />
            <Stack.Screen
              name="PetProfile"
              component={PetProfileScreen}
              options={{ ...mainScreenOptions, title: '' }}
            />
            <Stack.Screen
              name="AddEditPet"
              component={AddEditPetScreen}
              options={({ route }) => ({
                ...mainScreenOptions,
                title: route.params?.petId ? 'Edit Pet' : 'Add New Pet',
              })}
            />
            <Stack.Screen
              name="AddEditHealthEvent"
              component={AddEditHealthEventScreen}
              options={({ route }) => ({
                ...mainScreenOptions,
                title: route.params?.eventId ? 'Edit Event' : 'Add Health Event',
              })}
            />
            <Stack.Screen
              name="WeightHistory"
              component={WeightHistoryScreen}
              options={{ ...mainScreenOptions, title: 'Weight History' }}
            />
            <Stack.Screen
              name="Statistics"
              component={StatisticsScreen}
              options={{ ...mainScreenOptions, title: 'Statistics' }}
            />
            <Stack.Screen
              name="Grooming"
              component={GroomingScreen}
              options={{ ...mainScreenOptions, title: 'Grooming Log' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ ...mainScreenOptions, title: 'Settings' }}
            />
            <Stack.Screen
              name="Calendar"
              component={CalendarScreen}
              options={{ ...mainScreenOptions, title: 'Health Calendar' }}
            />
            <Stack.Screen
              name="Medications"
              component={MedicationsScreen}
              options={{ ...mainScreenOptions, title: 'Medications' }}
            />
            <Stack.Screen
              name="ActivityLog"
              component={ActivityLogScreen}
              options={{ ...mainScreenOptions, title: 'Activity Log' }}
            />
            <Stack.Screen
              name="Budget"
              component={BudgetScreen}
              options={{ ...mainScreenOptions, title: 'Budget Tracker' }}
            />
            <Stack.Screen
              name="PhotoAlbum"
              component={PhotoAlbumScreen}
              options={{ ...mainScreenOptions, title: 'Photo Album' }}
            />
            <Stack.Screen
              name="PetPassport"
              component={PetPassportScreen}
              options={{ ...mainScreenOptions, title: 'Pet Passport' }}
            />
            <Stack.Screen
              name="VetMap"
              component={VetMapScreen}
              options={{ ...mainScreenOptions, title: 'Vet Clinics' }}
            />
            <Stack.Screen
              name="Insurance"
              component={InsuranceScreen}
              options={{ ...mainScreenOptions, title: 'Insurance' }}
            />
            <Stack.Screen
              name="CareSchedule"
              component={CareScheduleScreen}
              options={{ ...mainScreenOptions, title: 'Care Schedule' }}
            />
            <Stack.Screen
              name="Nutrition"
              component={NutritionScreen}
              options={{ ...mainScreenOptions, title: 'Nutrition Analysis' }}
            />
            <Stack.Screen
              name="Compare"
              component={CompareScreen}
              options={{ ...mainScreenOptions, title: 'Compare Pets' }}
            />
            <Stack.Screen
              name="AIAdvice"
              component={AIAdviceScreen}
              options={{ ...mainScreenOptions, title: 'AI Advice' }}
            />
            <Stack.Screen
              name="Symptoms"
              component={SymptomsScreen}
              options={{ ...mainScreenOptions, title: 'Symptoms' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
