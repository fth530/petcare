export const colors = {
  // Primary - Calming & Trustworthy
  primary: {
    900: '#1E40AF', // Deep Blue
    700: '#1D4ED8', // Standard Blue
    500: '#3B82F6', // Bright Blue (Accents, Buttons)
    100: '#DBEAFE', // Light Blue (Backgrounds)
  },

  // Accent - Warm & Energetic
  accent: {
    500: '#F97316', // Orange (CTA, Highlights)
    300: '#FDBA74', // Light Orange
  },

  // Neutrals - Soft & Clean
  neutral: {
    900: '#111827', // Almost Black (Text)
    700: '#374151', // Dark Gray
    500: '#6B7280', // Medium Gray
    300: '#D1D5DB', // Added 300
    200: '#E5E7EB', // Light Gray (Borders)
    100: '#F3F4F6', // Added 100
    50: '#F9FAFB',  // Off-White (Backgrounds)
    white: '#FFFFFF',
  },

  // Semantic Colors
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  error: '#EF4444',   // Red
  background: '#F9FAFB', // App Background
};

export const typography = {
  heading: {
    fontFamily: 'System', // Bold applied where used
    color: colors.neutral[900],
  },
  body: {
    fontFamily: 'System', // Regular applied where used
    color: colors.neutral[700],
  },
  caption: {
    fontFamily: 'System', // Medium applied where used
    color: colors.neutral[500],
  },
};

export const styling = {
  borderRadius: 12,
  spacing: {
    4: 4,
    8: 8,
    12: 12,
    16: 16,
    24: 24,
    32: 32,
    48: 48,
    64: 64,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2, // For Android
  },
};
