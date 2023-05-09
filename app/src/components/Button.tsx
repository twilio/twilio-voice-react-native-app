import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type InheritedTouchableOpacityProps = Pick<
  TouchableOpacity['props'],
  'disabled' | 'onPress' | 'accessibilityLabel'
>;

export type Props = React.PropsWithChildren<
  {
    size: number;
  } & InheritedTouchableOpacityProps
>;

const Button: React.FC<Props> = ({
  accessibilityLabel,
  children,
  disabled,
  onPress,
  size,
}) => {
  const containerStyle = React.useMemo(
    () => ({
      ...styles.container,
      ...{
        height: size,
        width: size,
        opacity: disabled ? 0.2 : 1,
      },
    }),
    [size, disabled],
  );

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}>
      <View style={containerStyle}>{children}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Button;
