import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ActiveCallSource = require('../../../assets/icons/active-call.png');

export type Props = {
  subtitle: string;
  title: string;
  onPress: () => void;
};

const ActiveCallBanner: React.FC<Props> = ({ subtitle, title, onPress }) => (
  <TouchableOpacity style={styles.container} onPress={onPress}>
    <View style={styles.title}>
      <Image
        style={styles.titleImage}
        source={ActiveCallSource}
        resizeMode="contain"
      />
      <Text style={styles.titleText}>{title}</Text>
    </View>
    <View style={styles.spacer} />
    <Text style={styles.subtitle}>{subtitle}</Text>
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
  subtitle: {
    fontSize: 14,
    fontWeight: '300',
    padding: 4,
  },
  spacer: {
    flexGrow: 1,
  },
  title: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    padding: 4,
  },
  titleImage: {
    maxHeight: '50%',
    maxWidth: '50%',
  },
  titleText: {
    color: 'black',
    fontSize: 16,
  },
});

export default ActiveCallBanner;
