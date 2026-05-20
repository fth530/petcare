import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { PetListScreen } from '../screens/PetListScreen';
import { PetProfileScreen } from '../screens/PetProfileScreen';
import { AddEditPetScreen } from '../screens/AddEditPetScreen';
import { AddEditHealthEventScreen } from '../screens/AddEditHealthEventScreen';
import { colors } from '../theme';

export type RootStackParamList = {
  PetList: undefined;
  PetProfile: { petId: string };
  AddEditPet: { petId?: string }; // undefined means 'Add' mode
  AddEditHealthEvent: { petId: string; eventId?: string }; // undefined eventId means 'Add' mode
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: colors.neutral[900],
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen
          name="PetList"
          component={PetListScreen}
          options={{ title: 'My Pets' }}
        />
        <Stack.Screen
          name="PetProfile"
          component={PetProfileScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="AddEditPet"
          component={AddEditPetScreen}
          options={({ route }) => ({
            title: route.params?.petId ? 'Edit Pet' : 'Add New Pet',
          })}
        />
        <Stack.Screen
          name="AddEditHealthEvent"
          component={AddEditHealthEventScreen}
          options={({ route }) => ({
            title: route.params?.eventId ? 'Edit Event' : 'Add Health Event',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
