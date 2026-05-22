import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { Button } from './Button';
import { colors, styling } from '../theme';

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Typography variant="heading" style={styles.title}>Something went wrong</Typography>
          <Typography variant="caption" style={styles.message}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </Typography>
          <Button title="Try Again" onPress={this.handleReset} style={styles.button} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: styling.spacing[32],
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    marginBottom: styling.spacing[12],
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: styling.spacing[32],
    color: colors.neutral[500],
  },
  button: {
    minWidth: 160,
  },
});
