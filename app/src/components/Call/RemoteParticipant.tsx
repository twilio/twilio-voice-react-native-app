import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export type Props = { title: string; subtitle: string };

const RemoteParticipant: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <View style={styles.container} accessibilityLabel="remote participant">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    color: 'black',
    fontSize: 24,
  },
  subtitle: {
    color: 'black',
    fontSize: 12,
  },
});

export default RemoteParticipant;
