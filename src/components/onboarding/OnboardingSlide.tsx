import { Colors, Typography } from '@/theme';
import type React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface OnboardingSlideProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.graphicContainer}>{children}</View>

        <View style={styles.textContainer}>
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Animated.Text style={styles.title}>{title}</Animated.Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <Animated.Text style={styles.description}>{description}</Animated.Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: '25%', // Visual balance
  },
  graphicContainer: {
    height: width * 0.8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  textContainer: {
    gap: 16,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    textAlign: 'left',
  },
  description: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'left',
    opacity: 0.9,
  },
});
