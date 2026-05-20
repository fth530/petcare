# PetCare MVP

A minimal cross-platform pet-care companion built with Expo (SDK 54) + React Native 0.81 + TypeScript.

## Features

- Add / edit / delete pets (name, type, gender, breed, weight, date of birth, avatar from photo library)
- Daily food & water logging with animated progress
- Health event tracker (vaccines, vet visits, medication, deworming) with date, next-due date, notes
- Persistent state via Zustand + AsyncStorage (hydration-aware)
- Haptic feedback and Reanimated transitions

## Tech

| Layer | Library |
|------|---------|
| Runtime | Expo SDK 54 |
| UI | React Native 0.81 |
| Navigation | @react-navigation/native v7 (native-stack) |
| State | Zustand v5 + persist middleware |
| Storage | @react-native-async-storage/async-storage |
| Dates | date-fns v4 |
| Animation | react-native-reanimated v4 |
| Icons | @expo/vector-icons |

## Getting started

```bash
npm install
npm run start    # Expo dev server
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web preview
```

## Project layout

```
src/
  components/   Reusable UI primitives (Button, Card, Avatar, TextInput, ProgressBar, Typography)
  navigation/   RootNavigator + typed param list
  screens/      PetList, PetProfile, AddEditPet, AddEditHealthEvent
  store/        Zustand store with persist
  theme/        Colors, typography, spacing tokens
  types/        Domain models
```

## Type checking

```bash
npx tsc --noEmit
```

A pre-commit hook (`pre-commit-checks.sh`) runs the same check.

## Notes

- Dates are entered as `YYYY-MM-DD` strings and stored as ISO 8601.
- Mock data loads only after persisted state has hydrated, so existing user data is never overwritten.
- New Architecture is enabled (`newArchEnabled: true` in `app.json`).
