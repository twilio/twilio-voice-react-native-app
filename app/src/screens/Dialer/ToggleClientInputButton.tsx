import React from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import Button from '../../components/Button';

const TypeSource = require('../../../assets/icons/type.png');

export type Props = {
  isOutgoingClient: boolean;
  onPress: () => void;
};

const BackspaceButton: React.FC<Props> = ({ isOutgoingClient, onPress }) => (
  <Button size={96} onPress={onPress}>
    <Image source={TypeSource} resizeMode="contain" style={styles.image} />
    <Text style={styles.text}>{isOutgoingClient ? 'Client' : 'PSTN'}</Text>
  </Button>
);

const styles = StyleSheet.create({
  image: {
    maxHeight: '35%',
  },
  text: {
    fontSize: 10,
    fontWeight: '300',
  },
});

export default BackspaceButton;
