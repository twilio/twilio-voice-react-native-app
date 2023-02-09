import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Home: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ahoy!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
  title: {
    fontSize: 48,
    flexGrow: 1,
    textAlignVertical: 'center',
    color: 'black',
  },
});

export default Home;
