import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Home: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Ahoy!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});

export default Home;
