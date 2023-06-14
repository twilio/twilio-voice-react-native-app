import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Button, { type Props as ButtonProps } from '../../components/Button';

const BackspaceSource = require('../../../assets/icons/backspace.png');

export type Props = Pick<ButtonProps, 'disabled' | 'onPress'>;

const BackspaceButton: React.FC<Props> = ({ disabled, onPress }) => (
  <Button
    size={96}
    disabled={disabled}
    onPress={onPress}
    testID="back_space_button">
    <Image source={BackspaceSource} resizeMode="contain" style={styles.image} />
  </Button>
);

const styles = StyleSheet.create({
  image: {
    maxHeight: '50%',
  },
});

export default BackspaceButton;
