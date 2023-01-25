import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Button from '../../components/Button';

const SelectAudioDeviceSource = require('../../../assets/icons/speaker.png');

export type Props = { disabled?: boolean; onPress: () => void };

const MuteButton: React.FC<Props> = ({ disabled, onPress }) => (
  <Button size={96} disabled={disabled} onPress={onPress}>
    <Image
      source={SelectAudioDeviceSource}
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

export default MuteButton;
