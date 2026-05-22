import React, { useState } from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface AvatarProps {
  uri?: string;
  size?: number;
  style?: ViewStyle;
  testID?: string;
}

export const Avatar: React.FC<AvatarProps> = React.memo(({ uri, size = 64, style, testID }) => {
  const [error, setError] = useState(false);

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style
      ]}
    >
      {uri && !error ? (
        <Animated.Image
          testID={testID ? `${testID}-image` : undefined}
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          onError={() => {
            console.warn('[Avatar] Failed to load image URI:', uri);
            setError(true);
          }}
          entering={FadeIn.duration(500)}
        />
      ) : (
        <Ionicons name="paw" size={size * 0.5} color={colors.neutral[500]} />
      )}
    </View>
  );
});

Avatar.displayName = 'Avatar';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
