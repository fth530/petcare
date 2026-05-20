import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, styling } from '../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: styling.borderRadius,
    padding: styling.spacing[16],
    ...styling.shadow,
    marginBottom: styling.spacing[16],
  },
});
