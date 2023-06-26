import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ActiveCallSource = require('../../../assets/icons/active-call.png');

export type Props = {
  callDuration: string;
  hidden: boolean;
  onPress: () => void;
  participant: string;
};

const ActiveCallBanner: React.FC<Props> = ({
  callDuration,
  hidden,
  onPress,
  participant,
}) =>
  hidden ? null : (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.participant}>
        <Image
          style={styles.participantImage}
          source={ActiveCallSource}
          resizeMode="contain"
        />
        <Text style={styles.participantText}>{participant}</Text>
      </View>
      <View style={styles.spacer} />
      <Text style={styles.callDuration}>{callDuration}</Text>
    </TouchableOpacity>
  );

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgb(235, 255, 235)',
    borderBottomColor: 'green',
    borderBottomWidth: 2,
    display: 'flex',
    flexDirection: 'row',
    paddingRight: 4,
    paddingLeft: 4,
  },
  callDuration: {
    fontSize: 14,
    fontWeight: '300',
    padding: 4,
  },
  spacer: {
    flexGrow: 1,
  },
  participant: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    padding: 4,
  },
  participantImage: {
    maxHeight: '50%',
    maxWidth: '50%',
  },
  participantText: {
    color: 'black',
    fontSize: 16,
  },
});

export default ActiveCallBanner;
