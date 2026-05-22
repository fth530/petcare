import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../components/Button';

describe('Button', () => {
  it('renders the title', () => {
    const { getByText } = render(<Button title="Press Me" />);
    expect(getByText('Press Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Tap" onPress={onPress} />);
    fireEvent.press(getByText('Tap'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Disabled" onPress={onPress} disabled />);
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders secondary variant', () => {
    const { getByText } = render(<Button title="Secondary" variant="secondary" />);
    expect(getByText('Secondary')).toBeTruthy();
  });

  it('renders danger variant', () => {
    const { getByText } = render(<Button title="Delete" variant="danger" />);
    expect(getByText('Delete')).toBeTruthy();
  });

  it('has correct accessibility role', () => {
    const { getByRole } = render(<Button title="Submit" />);
    expect(getByRole('button')).toBeTruthy();
  });
});
