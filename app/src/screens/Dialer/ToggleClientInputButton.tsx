import React from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import Button, { type Props as ButtonProps } from '../../components/Button';
import { type RecipientType } from '../../types';

const TypeSource = require('../../../assets/icons/type.png');

export type Props = {
  recipientType: RecipientType;
} & Pick<ButtonProps, 'disabled' | 'onPress'>;

const ToggleClientInputButton: React.FC<Props> = ({
  disabled,
  onPress,
  recipientType,
}) => (
  <Button disabled={disabled} size={96} onPress={onPress}>
    <Image source={TypeSource} resizeMode="contain" style={styles.image} />
    <Text style={styles.text}>
      {recipientType === 'pstn' ? 'PSTN' : 'Client'}
    </Text>
  </Button>
);

const styles = StyleSheet.create({
  image: {
    maxHeight: '35%',
  },
  text: {
    fontSize: 10,
    fontWeight: '300',
    color: 'black',
  },
});

export default ToggleClientInputButton;
