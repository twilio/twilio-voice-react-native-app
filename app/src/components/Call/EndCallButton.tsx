import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Button, { type Props as ButtonProps } from '../../components/Button';

const HangupSource = require('../../../assets/icons/end-call.png');

export type Props = Pick<ButtonProps, 'disabled' | 'onPress'>;

const HangupButton: React.FC<Props> = ({ disabled, onPress }) => (
  <Button
    accessibilityLabel="end call"
    size={96}
    disabled={disabled}
    onPress={onPress}>
    <Image source={HangupSource} resizeMode="contain" style={styles.image} />
  </Button>
);

const styles = StyleSheet.create({
  image: {
    maxHeight: '75%',
  },
});

export default HangupButton;
