import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Button from '../../components/Button';

const MuteSource = require('../../../assets/icons/mute.png');
const MuteActiveSource = require('../../../assets/icons/mute-active.png');

export type Props = {
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const MuteButton: React.FC<Props> = ({ active, disabled, onPress }) => (
  <Button size={96} disabled={disabled} onPress={onPress}>
    {active ? (
      <Image
        source={MuteActiveSource}
        resizeMode="contain"
        style={styles.image}
      />
    ) : (
      <Image source={MuteSource} resizeMode="contain" style={styles.image} />
    )}
  </Button>
);

const styles = StyleSheet.create({
  image: {
    maxHeight: '50%',
  },
});

export default MuteButton;
