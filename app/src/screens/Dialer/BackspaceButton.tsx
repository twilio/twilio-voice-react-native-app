import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Button from '../../components/Button';

const BackspaceSource = require('../../../assets/icons/backspace.png');

export type Props = { disabled: boolean; onPress: () => void };

const BackspaceButton: React.FC<Props> = ({ disabled, onPress }) => (
  <Button size={96} disabled={disabled} onPress={onPress}>
    <Image source={BackspaceSource} resizeMode="contain" style={styles.image} />
  </Button>
);

const styles = StyleSheet.create({
  image: {
    maxHeight: '50%',
  },
});

export default BackspaceButton;
