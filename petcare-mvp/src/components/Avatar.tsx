import React, { useState, useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
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
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (uri && !error) {
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  }, [uri, error]);

  return (
    <View
      testID={testID}
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}
    >
      {uri && !error ? (
        <Animated.Image
          testID={testID ? `${testID}-image` : undefined}
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2, opacity }}
          onError={() => {
            console.warn('[Avatar] Failed to load image URI:', uri);
            setError(true);
          }}
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
