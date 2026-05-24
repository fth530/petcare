export const lightColors = {
  primary: { 900: '#1E40AF', 700: '#1D4ED8', 500: '#3B82F6', 100: '#DBEAFE' },
  accent: { 500: '#F97316', 300: '#FDBA74' },
  neutral: {
    900: '#111827', 700: '#374151', 500: '#6B7280',
    300: '#D1D5DB', 200: '#E5E7EB', 100: '#F3F4F6',
    50: '#F9FAFB', white: '#FFFFFF',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  subtext: '#6B7280',
};

export const darkColors = {
  primary: { 900: '#93C5FD', 700: '#60A5FA', 500: '#3B82F6', 100: '#1E3A5F' },
  accent: { 500: '#F97316', 300: '#FDBA74' },
  neutral: {
    900: '#F9FAFB', 700: '#E5E7EB', 500: '#9CA3AF',
    300: '#4B5563', 200: '#374151', 100: '#1F2937',
    50: '#111827', white: '#1F2937',
  },
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  background: '#0F172A',
  card: '#1E293B',
  border: '#334155',
  text: '#F1F5F9',
  subtext: '#94A3B8',
};

export type AppColors = typeof lightColors;

// Default export for backward compatibility (screens not yet on theme context use this)
export const colors = lightColors;

export const typography = {
  heading: { fontFamily: 'System', color: lightColors.neutral[900] },
  body: { fontFamily: 'System', color: lightColors.neutral[700] },
  caption: { fontFamily: 'System', color: lightColors.neutral[500] },
};

export const styling = {
  borderRadius: 12,
  spacing: { 4: 4, 8: 8, 12: 12, 16: 16, 24: 24, 32: 32, 48: 48, 64: 64 },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  shadowDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
};
