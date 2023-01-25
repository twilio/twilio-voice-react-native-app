import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export type Props = { title: string; subtitle: string };

const RemoteParticipant: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <View style={styles.container}>
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
    fontSize: 24,
  },
  subtitle: {
    fontSize: 12,
  },
});

export default RemoteParticipant;
