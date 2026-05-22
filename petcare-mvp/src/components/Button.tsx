import React from 'react';
import { Text, StyleSheet, Pressable, PressableProps, ViewStyle, TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, styling } from '../theme';
import * as Haptics from 'expo-haptics';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  style,
  textStyle,
  icon,
  onPress,
  disabled,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onPress) onPress(e);
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.neutral[200];
    switch (variant) {
      case 'primary': return colors.accent[500];
      case 'secondary': return colors.primary[100];
      case 'danger': return colors.error;
      default: return colors.accent[500];
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.neutral[500];
    switch (variant) {
      case 'primary': return colors.neutral.white;
      case 'secondary': return colors.primary[700];
      case 'danger': return colors.neutral.white;
      default: return colors.neutral.white;
    }
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        animatedStyle,
        style
      ]}
      {...props}
    >
      {icon}
      <Text
        style={[
          styles.text,
          icon ? styles.textWithIcon : null,
          { color: getTextColor() },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: styling.spacing[16],
    paddingHorizontal: styling.spacing[24],
    borderRadius: styling.borderRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: styling.spacing[8],
  },
});
