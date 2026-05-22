import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { colors, styling } from '../theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = React.memo(({ progress, style }) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value * 100}%`,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
});

ProgressBar.displayName = 'ProgressBar';

const styles = StyleSheet.create({
  container: {
    height: 12,
    backgroundColor: colors.neutral[200],
    borderRadius: 6,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent[500],
    borderRadius: 6,
  },
});
