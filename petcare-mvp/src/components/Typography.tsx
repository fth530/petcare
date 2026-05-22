import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { typography } from '../theme';

interface TypographyProps extends TextProps {
  variant?: 'heading' | 'body' | 'caption';
  bold?: boolean;
}

export const Typography: React.FC<TypographyProps> = React.memo(({
  variant = 'body',
  bold,
  style,
  children,
  ...props
}) => {
  const baseStyle = typography[variant];

  return (
    <Text
      style={[
        baseStyle,
        bold && { fontWeight: 'bold' },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
});

Typography.displayName = 'Typography';
