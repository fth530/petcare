jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(null),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  clear: jest.fn().mockResolvedValue(null),
  getAllKeys: jest.fn().mockResolvedValue([]),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(null),
  multiRemove: jest.fn().mockResolvedValue(null),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = (props) => React.createElement(Text, { testID: props.testID }, props.name || '');
  return {
    Ionicons: MockIcon,
    MaterialCommunityIcons: MockIcon,
    AntDesign: MockIcon,
    FontAwesome: MockIcon,
    MaterialIcons: MockIcon,
  };
});

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily' },
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock-document-directory/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: { UTF8: 'utf8' },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-calendar', () => ({
  requestCalendarPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getDefaultCalendarAsync: jest.fn().mockResolvedValue({ id: 'mock-calendar-id' }),
  createEventAsync: jest.fn().mockResolvedValue('mock-event-id'),
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file:///mock.pdf' }),
}));

jest.mock('./src/i18n', () => {
  const { translations } = require('./src/i18n/translations');
  return {
    useTranslation: () => ({
      t: (key) => translations.en[key] ?? key,
      language: 'en',
      setLanguage: jest.fn(),
    }),
    I18nProvider: ({ children }) => children,
  };
});

jest.mock('./src/context/ThemeContext', () => {
  const { lightColors, styling } = require('./src/theme');
  return {
    useTheme: () => ({
      colors: lightColors,
      isDark: false,
      toggleTheme: jest.fn(),
      styling,
    }),
    ThemeProvider: ({ children }) => children,
  };
});

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  const Image = require('react-native').Image;
  return {
    __esModule: true,
    default: {
      View,
      Image,
      Text: require('react-native').Text,
      ScrollView: require('react-native').ScrollView,
      FlatList: require('react-native').FlatList,
      createAnimatedComponent: (component) => component,
      Value: jest.fn(),
      event: jest.fn(),
      add: jest.fn(),
      eq: jest.fn(),
      set: jest.fn(),
      cond: jest.fn(),
      interpolate: jest.fn(),
      View: View,
      Image: Image,
      Extrapolate: { CLAMP: 'clamp' },
      Transition: { Together: 'Together', Out: 'Out', In: 'In', Change: 'Change' },
      Easing: {
        inOut: jest.fn(),
        in: jest.fn(),
        out: jest.fn(),
        linear: jest.fn(),
        exp: jest.fn(),
      },
    },
    Easing: {
      inOut: jest.fn(),
      in: jest.fn(),
      out: jest.fn(),
      linear: jest.fn(),
      exp: jest.fn(),
      bezier: jest.fn(),
    },
    useSharedValue: (val) => ({ value: val }),
    useAnimatedStyle: (fn) => ({}),
    withTiming: jest.fn((val) => val),
    withSpring: jest.fn((val) => val),
    withDelay: jest.fn((_, val) => val),
    withSequence: jest.fn(),
    withRepeat: jest.fn(),
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    makeMutable: (val) => ({ value: val }),
    FadeIn: {
      delay: () => ({ duration: () => ({ withInitialValues: () => ({}) }) }),
      duration: () => ({}),
    },
    FadeOut: { duration: () => ({}) },
    SlideInRight: { duration: () => ({}) },
    createAnimatedComponent: (component) => component,
    View,
    Image,
  };
});

