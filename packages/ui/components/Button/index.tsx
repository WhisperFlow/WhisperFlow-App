import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';

const COLORS = {
  primary: {
    main: '#007BFF',
    text: '#FFFFFF',
  },
  secondary: {
    main: '#6C757D',
    text: '#FFFFFF',
  },
  default: {
    main: '#E9ECEF',
    text: '#212529',
  },
};

interface ButtonProps {
  children?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'default';
  disabled?: boolean;
  loading?: boolean;
  ref?: React.RefObject<any>;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  width?: number;
}

export const WFButton: React.FC<ButtonProps> = ({
  children,
  onPress,
  onLongPress,
  style,
  className,
  size = 'medium',
  color = 'primary',
  disabled = false,
  loading = false,
  ref,
  startIcon,
  endIcon,
  width,
  ...props
}) => {
  const buttonStyles = [
    styles.button,
    styles[size],
    disabled && styles.disabled,
    loading && styles.loading,
    { backgroundColor: COLORS[color].main },
    width ? { width: width } : {},
    style,
  ];

  const textStyles = [
    styles.buttonText,
    { color: COLORS[color].text }, // 修改处：按钮文本颜色
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading && <ActivityIndicator color={COLORS[color].text} />}
      {startIcon}
      <Text style={textStyles}>{children}</Text>
      {endIcon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    gap: 8,
  },

  small: {
    height: 34,
    paddingHorizontal: 12,
  },
  medium: {
    height: 40,
    paddingHorizontal: 16,
  },
  large: {
    height: 46,
    paddingHorizontal: 20,
  },

  primaryContained: {
    backgroundColor: COLORS.primary.main,
  },
  secondaryContained: {
    backgroundColor: COLORS.secondary.main,
  },
  defaultContained: {
    backgroundColor: COLORS.default.main,
  },

  primaryOutlined: {
    borderColor: COLORS.primary.main,
  },
  secondaryOutlined: {
    borderColor: COLORS.secondary.main,
  },
  defaultOutlined: {
    borderColor: COLORS.default.main,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: COLORS.primary.text,
  },
  secondaryText: {
    color: COLORS.secondary.text,
  },
  defaultText: {
    color: COLORS.default.text,
  },
  outlinedText: {
    color: COLORS.primary.main,
  },
  textText: {
    color: COLORS.primary.main,
  },

  disabled: {
    opacity: 0.5,
  },
  loading: {
    opacity: 0.8,
  },
});