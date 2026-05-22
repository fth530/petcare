import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from '../../components/Avatar';

describe('Avatar', () => {
  it('renders without crashing when no uri given', () => {
    const { toJSON } = render(<Avatar />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders without crashing when uri is provided', () => {
    const { toJSON } = render(<Avatar uri="https://example.com/photo.jpg" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the container view with testID', () => {
    const { getByTestId } = render(<Avatar testID="my-avatar" />);
    expect(getByTestId('my-avatar')).toBeTruthy();
  });

  it('applies size to container dimensions', () => {
    const { getByTestId } = render(<Avatar size={80} testID="sized-avatar" />);
    const el = getByTestId('sized-avatar');
    const containerStyle = Array.isArray(el.props.style)
      ? Object.assign({}, ...el.props.style.filter(Boolean))
      : el.props.style;
    expect(containerStyle.width).toBe(80);
    expect(containerStyle.height).toBe(80);
  });
});
