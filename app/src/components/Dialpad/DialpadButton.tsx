import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Button, { type Props as ButtonProps } from '../Button';

export type Props = {
  title: string;
  subtitle: string;
} & Pick<ButtonProps, 'disabled' | 'onPress'>;

const DialpadButton: React.FC<Props> = ({
  disabled,
  title,
  subtitle,
  onPress,
}) => (
  <Button
    disabled={disabled}
    size={96}
    onPress={onPress}
    testID={`dialpad_button_${title}`}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </Button>
);

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '300',
    color: 'black',
  },
});

export default DialpadButton;
