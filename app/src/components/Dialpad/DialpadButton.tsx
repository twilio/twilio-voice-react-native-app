import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Button from '../Button';

export type Props = {
  disabled?: boolean;
  title: string;
  subtitle: string;
  onPress: () => void;
};

const DialpadButton: React.FC<Props> = ({
  disabled,
  title,
  subtitle,
  onPress,
}) => (
  <Button disabled={disabled} size={96} onPress={onPress}>
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
