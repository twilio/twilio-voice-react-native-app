import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Button from '../../components/Button';

const ShowDialpadSource = require('../../../assets/icons/dialpad-dark.png');

export type Props = { disabled?: boolean; onPress: () => void };

const ShowDialpadButton: React.FC<Props> = ({ disabled, onPress }) => (
  <Button size={96} disabled={disabled} onPress={onPress}>
    <Image
      source={ShowDialpadSource}
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

export default ShowDialpadButton;
