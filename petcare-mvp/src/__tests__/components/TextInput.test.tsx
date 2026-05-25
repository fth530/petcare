import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput } from '../../components/TextInput';

describe('TextInput', () => {
  it('renders the label', () => {
    const { getByText } = render(<TextInput label="Pet Name" value="" onChangeText={jest.fn()} />);
    expect(getByText('Pet Name')).toBeTruthy();
  });

  it('renders with given placeholder', () => {
    const { getByPlaceholderText } = render(
      <TextInput label="Weight" value="" onChangeText={jest.fn()} placeholder="e.g., 10" />
    );
    expect(getByPlaceholderText('e.g., 10')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <TextInput label="Amount" value="" onChangeText={onChange} placeholder="100" />
    );
    fireEvent.changeText(getByPlaceholderText('100'), '250');
    expect(onChange).toHaveBeenCalledWith('250');
  });

  it('reflects controlled value', () => {
    const { getByDisplayValue } = render(
      <TextInput label="Name" value="Buddy" onChangeText={jest.fn()} />
    );
    expect(getByDisplayValue('Buddy')).toBeTruthy();
  });
});
