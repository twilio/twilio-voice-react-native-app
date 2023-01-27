import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Button from '../../components/Button';

const HideDialpadSource = require('../../../assets/icons/hide-dialpad.png');

export type Props = { disabled?: boolean; onPress: () => void };

const HideDialpadButton: React.FC<Props> = ({ disabled, onPress }) => (
  <Button size={96} disabled={disabled} onPress={onPress}>
    <Image
      source={HideDialpadSource}
      resizeMode="contain"
      style={styles.image}
    />
  </Button>
);

const styles = StyleSheet.create({
  image: {
    maxHeight: '50%',
  },
});

export default HideDialpadButton;