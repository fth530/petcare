import React from 'react';
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
import { useTheme } from '../context/ThemeContext';

export type RootStackParamList = {
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
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: 'bold', color: colors.text },
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="PetList" component={PetListScreen} options={{ title: 'My Pets' }} />
        <Stack.Screen name="PetProfile" component={PetProfileScreen} options={{ title: '' }} />
        <Stack.Screen
          name="AddEditPet"
          component={AddEditPetScreen}
          options={({ route }) => ({ title: route.params?.petId ? 'Edit Pet' : 'Add New Pet' })}
        />
        <Stack.Screen
          name="AddEditHealthEvent"
          component={AddEditHealthEventScreen}
          options={({ route }) => ({ title: route.params?.eventId ? 'Edit Event' : 'Add Health Event' })}
        />
        <Stack.Screen name="WeightHistory" component={WeightHistoryScreen} options={{ title: 'Weight History' }} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ title: 'Statistics' }} />
        <Stack.Screen name="Grooming" component={GroomingScreen} options={{ title: 'Grooming Log' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Health Calendar' }} />
        <Stack.Screen name="Medications" component={MedicationsScreen} options={{ title: 'Medications' }} />
        <Stack.Screen name="ActivityLog" component={ActivityLogScreen} options={{ title: 'Activity Log' }} />
        <Stack.Screen name="Budget" component={BudgetScreen} options={{ title: 'Budget Tracker' }} />
        <Stack.Screen name="PhotoAlbum" component={PhotoAlbumScreen} options={{ title: 'Photo Album' }} />
        <Stack.Screen name="PetPassport" component={PetPassportScreen} options={{ title: 'Pet Passport' }} />
        <Stack.Screen name="VetMap" component={VetMapScreen} options={{ title: 'Vet Clinics' }} />
        <Stack.Screen name="Insurance" component={InsuranceScreen} options={{ title: 'Insurance' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
