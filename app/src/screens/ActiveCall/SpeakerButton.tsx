import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Button, { type Props as ButtonProps } from '../../components/Button';

const SpeakerSource = require('../../../assets/icons/speaker.png');
const ActiveSpeakerSource = require('../../../assets/icons/speaker-active.png');

export type Props = {
  active?: boolean;
} & Pick<ButtonProps, 'disabled' | 'onPress'>;

const SpeakerButton: React.FC<Props> = ({ active, disabled, onPress }) => (
  <Button
    size={96}
    disabled={disabled}
    onPress={onPress}
    testID="speaker_button">
    {active ? (
      <Image
        source={ActiveSpeakerSource}
        resizeMode="contain"
        style={styles.image}
      />
    ) : (
      <Image source={SpeakerSource} resizeMode="contain" style={styles.image} />
    )}
  </Button>
);

const styles = StyleSheet.create({
  image: {
    maxHeight: '50%',
  },
});

export default SpeakerButton;
