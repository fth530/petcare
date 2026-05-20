import React, { useState } from 'react';
import { View, TextInput as RNTextInput, TextInputProps as RNTextInputProps, StyleSheet, Text } from 'react-native';
import { colors, styling, typography } from '../theme';

interface TextInputProps extends RNTextInputProps {
  label: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, style, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <RNTextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          style
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={colors.neutral[500]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: styling.spacing[16],
  },
  label: {
    ...typography.caption,
    marginBottom: styling.spacing[8],
    fontWeight: '500',
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: styling.borderRadius,
    padding: styling.spacing[16],
    backgroundColor: colors.neutral.white,
  },
  inputFocused: {
    borderColor: colors.primary[500],
  },
});
