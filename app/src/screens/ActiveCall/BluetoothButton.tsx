import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Button, { type Props as ButtonProps } from '../../components/Button';

const BluetoothSource = require('../../../assets/icons/bluetooth.png');
const ActiveBluetoothSource = require('../../../assets/icons/bluetooth-active.png');

export type Props = {
  active?: boolean;
} & Pick<ButtonProps, 'disabled' | 'onPress'>;

const SelectAudioOutputDeviceButton: React.FC<Props> = ({
  active,
  disabled,
  onPress,
}) => (
  <Button
    size={96}
    disabled={disabled}
    onPress={onPress}
    testID="bluetooth_button">
    {active ? (
      <Image
        source={ActiveBluetoothSource}
        resizeMode="contain"
        style={styles.image}
      />
    ) : (
      <Image
        source={BluetoothSource}
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
