@AGENTS.md

# PetCare MVP — Project Guide

## Stack
- **Expo ~54** (New Architecture enabled) + **React Native 0.81.5** + **React 19**
- **TypeScript** strict mode — all files must pass `npx tsc --noEmit`
- **Zustand v5** for state + **AsyncStorage** for persistence
- **react-native-reanimated v4** for animations (native thread)
- **date-fns v4** for date formatting/parsing

## Architecture

```
src/
  components/   # Shared UI primitives (Button, Card, Avatar, ProgressBar, Typography, TextInput, ErrorBoundary)
  constants/    # Magic numbers and app-wide limits (FOOD_TARGET_GRAMS, WEIGHT_MAX_KG, etc.)
  navigation/   # RootNavigator — NativeStack with 4 screens
  screens/      # PetListScreen, PetProfileScreen, AddEditPetScreen, AddEditHealthEventScreen
  store/        # petStore.ts — single Zustand store, persisted via AsyncStorage
  theme/        # colors, typography, styling tokens
  types/        # Pet, HealthEvent, FoodLog, WaterLog interfaces
  __tests__/    # Jest tests for store, components and screens
```

## Key Conventions

- All dates stored as ISO 8601 strings (`new Date().toISOString()`)
- IDs generated with `generateId()` in petStore (timestamp + random suffix)
- `hasHydrated` gate in `App.tsx` prevents mock data from loading before AsyncStorage rehydrates
- All interactive elements must have `accessibilityLabel` and `accessibilityRole`
- Haptics calls must be fire-and-forget: `Haptics.impactAsync(...).catch(() => {})`
- `React.memo` on all shared components; `useMemo`/`useCallback` in screens for computed values

## Commands

```bash
npm test              # run Jest test suite
npm run test:coverage # run tests with coverage report
npm run lint          # ESLint (TypeScript + React + React Native rules)
npm run format        # Prettier format src/**
npx tsc --noEmit      # TypeScript type check
expo start            # start dev server
```

## Input Validation Rules

| Field        | Rule                                      |
|--------------|-------------------------------------------|
| Pet name     | Required, max 100 chars                   |
| Weight       | Optional, 0 – 1000 kg                     |
| Food amount  | Required in modal, 1 – 10000 g            |
| Dates        | YYYY-MM-DD, validated via regex + Date()  |

## Testing

Tests live in `src/__tests__/`. Run with `npm test`.

- `petStore.test.ts` — all store actions (addPet, updatePet, deletePet, addHealthEvent, addFoodLog, addWaterLog, loadMockData)
- `components/Button.test.tsx` — rendering, onPress, disabled state, variants
- `components/Avatar.test.tsx` — fallback icon, image, custom size
- `screens/PetListScreen.test.tsx` — empty state, pet list, navigation
- `screens/PetProfileScreen.test.tsx` — pet not found, food/water logging, validation

Mocks: `jest.setup.js` mocks AsyncStorage, expo-haptics, expo-image-picker, react-native-reanimated.
