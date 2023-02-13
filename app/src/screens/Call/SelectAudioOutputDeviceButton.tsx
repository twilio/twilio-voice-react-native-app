import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Button, { type Props as ButtonProps } from '../../components/Button';

const SelectAudioDeviceSource = require('../../../assets/icons/speaker.png');
const ActiveSelectAudioDeviceSource = require('../../../assets/icons/speaker-active.png');

export type Props = {
  active?: boolean;
} & Pick<ButtonProps, 'disabled' | 'onPress'>;

const SelectAudioOutputDeviceButton: React.FC<Props> = ({
  active,
  disabled,
  onPress,
}) => (
  <Button size={96} disabled={disabled} onPress={onPress}>
    {active ? (
      <Image
        source={ActiveSelectAudioDeviceSource}
        resizeMode="contain"
        style={styles.image}
      />
    ) : (
      <Image
        source={SelectAudioDeviceSource}
        resizeMode="contain"
        style={styles.image}
      />
    )}
  </Button>
);

const styles = StyleSheet.create({
  image: {
    maxHeight: '50%',
  },
});

export default SelectAudioOutputDeviceButton;
