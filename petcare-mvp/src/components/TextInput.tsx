import React, { useState } from 'react';
import { View, TextInput as RNTextInput, TextInputProps as RNTextInputProps, StyleSheet, Text } from 'react-native';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface TextInputProps extends RNTextInputProps {
  label: string;
}

export const TextInput: React.FC<TextInputProps> = React.memo(({ label, style, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.subtext }]}>{label}</Text>
      <RNTextInput
        style={[
          styles.input,
          {
            borderColor: isFocused ? colors.primary[500] : colors.border,
            color: colors.text,
            backgroundColor: colors.card,
          },
          style,
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={colors.neutral[500]}
        {...props}
      />
    </View>
  );
});

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: styling.spacing[16],
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: styling.spacing[8],
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: styling.borderRadius,
    padding: styling.spacing[16],
  },
});
