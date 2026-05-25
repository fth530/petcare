import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ViewToken,
  ListRenderItemInfo,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useOnboardingStore } from '../store/onboardingStore';
import { Button } from '../components/Button';
import { useTranslation } from '../i18n';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type MCIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  icon: MCIconName;
  gradientColors: [string, string];
  iconColor: string;
}

type TFunc = (key: import('../i18n').TranslationKey) => string;

const buildSlides = (t: TFunc): Slide[] => [
  {
    id: '1',
    title: t('onboarding1Title'),
    subtitle: t('onboarding1Subtitle'),
    icon: 'paw',
    gradientColors: ['#FF6B6B', '#FF9B42'],
    iconColor: '#FF6B6B',
  },
  {
    id: '2',
    title: t('onboarding2Title'),
    subtitle: t('onboarding2Subtitle'),
    icon: 'heart-pulse',
    gradientColors: ['#1DBFB8', '#1B8FDE'],
    iconColor: '#1DBFB8',
  },
  {
    id: '3',
    title: t('onboarding3Title'),
    subtitle: t('onboarding3Subtitle'),
    icon: 'calendar-heart',
    gradientColors: ['#7C3AED', '#C084FC'],
    iconColor: '#7C3AED',
  },
  {
    id: '4',
    title: t('onboarding4Title'),
    subtitle: t('onboarding4Subtitle'),
    icon: 'chart-areaspline',
    gradientColors: ['#059669', '#34D399'],
    iconColor: '#059669',
  },
];

// ── Dot ──────────────────────────────────────────────────────────────────────

interface DotProps {
  isActive: boolean;
}

const Dot = React.memo<DotProps>(({ isActive }) => {
  const dotWidth = useSharedValue(isActive ? 24 : 8);
  const dotOpacity = useSharedValue(isActive ? 1 : 0.5);

  useEffect(() => {
    dotWidth.value = withSpring(isActive ? 24 : 8, { damping: 15, stiffness: 200 });
    dotOpacity.value = withTiming(isActive ? 1 : 0.5, { duration: 250 });
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    width: dotWidth.value,
    opacity: dotOpacity.value,
  }));

  return <Animated.View style={[styles.dot, animStyle]} />;
});
Dot.displayName = 'Dot';

// ── SlideContent ─────────────────────────────────────────────────────────────

const SlideContent = React.memo<{ item: Slide }>(({ item }) => (
  <LinearGradient
    colors={item.gradientColors}
    start={{ x: 0.3, y: 0 }}
    end={{ x: 0.7, y: 1 }}
    style={styles.slide}
  >
    {/* Decorative background circles */}
    <View style={styles.decorTopLeft} />
    <View style={styles.decorBottomRight} />
    <View style={styles.decorTopRight} />
    <View style={styles.decorMidLeft} />

    {/* Illustration */}
    <View style={styles.illustrationArea}>
      <View style={styles.glowOuter} />
      <View style={styles.glowMiddle} />
      <View style={styles.glowInner} />
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={item.icon} size={72} color={item.iconColor} />
      </View>
    </View>

    {/* Text */}
    <View style={styles.textArea}>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  </LinearGradient>
));
SlideContent.displayName = 'SlideContent';

// ── OnboardingScreen ──────────────────────────────────────────────────────────

export const OnboardingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const { t } = useTranslation();

  const slides = useMemo(() => buildSlides(t), [t]);

  const isLastSlide = currentIndex === slides.length - 1;
  const currentSlide = slides[currentIndex];

  const onViewableItemsChangedRef = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      completeOnboarding();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  }, [currentIndex, isLastSlide, completeOnboarding]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    completeOnboarding();
  }, [completeOnboarding]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Slide>) => <SlideContent item={item} />,
    []
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChangedRef.current}
        viewabilityConfig={viewabilityConfig.current}
        getItemLayout={getItemLayout}
        style={StyleSheet.absoluteFill}
      />

      {/* Skip button — top right, hidden on last slide */}
      {!isLastSlide && (
        <TouchableOpacity
          style={[styles.skipButton, { top: insets.top + 16 }]}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.skipText}>{t('onboardingSkip')}</Text>
        </TouchableOpacity>
      )}

      {/* Bottom controls overlay */}
      <View
        style={[
          styles.bottomControls,
          { paddingBottom: Math.max(insets.bottom, 20) + 16 },
        ]}
      >
        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <Dot key={i} isActive={i === currentIndex} />
          ))}
        </View>

        {/* Next / Get Started */}
        <Button
          title={isLastSlide ? t('onboardingGetStarted') : t('onboardingNext')}
          onPress={handleNext}
          style={{ ...styles.nextButton, shadowColor: currentSlide.gradientColors[0] }}
          textStyle={{ ...styles.nextButtonText, color: currentSlide.iconColor }}
        />
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B6B',
  },

  // Slide
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    overflow: 'hidden',
  },

  // Decorative circles
  decorTopLeft: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -80,
    left: -80,
  },
  decorBottomRight: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -100,
    right: -100,
  },
  decorTopRight: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: 90,
    right: 30,
  },
  decorMidLeft: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: SCREEN_HEIGHT * 0.38,
    left: 20,
  },

  // Illustration
  illustrationArea: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  glowMiddle: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  glowInner: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  iconCircle: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: 'rgba(255,255,255,0.93)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },

  // Text
  textArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingTop: 16,
    paddingBottom: 200,
  },
  slideTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 26,
  },

  // Skip
  skipButton: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },

  // Bottom controls
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },

  // Next button
  nextButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: '100%',
    borderRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
