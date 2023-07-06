import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Linking,
  TouchableHighlight,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F4F6',
    height: '100%',
    display: 'flex',
    alignContent: 'center',
    marginTop: 100,
    marginHorizontal: 40,
  },
  header: {
    color: '#121C2D',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  section: {
    marginBottom: 50,
  },
  highlight: {
    color: '#0263E0',
  },
  channel: {
    color: '#0263E0',
    textDecorationLine: 'underline',
  },
  issueDescription: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

const About: React.FC = () => {
  const VOICE_BLOCKS_URL = 'https://twilio.slack.com/archives/C020DUH6R1B';
  const VOICE_BLOCKS_CHANNEL = '#eng-voice-blocks';

  const handlePress = async () => {
    await Linking.openURL(VOICE_BLOCKS_URL);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.header}>About</Text>
        <Text>This app is maintained by the Twilio Voice Access group</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.header}>Report an Issue</Text>
        <View style={styles.issueDescription}>
          <Text>For issues or bugs please reach out in the </Text>
          <TouchableHighlight onPress={handlePress}>
            <Text style={styles.channel}>{VOICE_BLOCKS_CHANNEL}</Text>
          </TouchableHighlight>
          <Text> slack channel</Text>
        </View>
      </View>
    </View>
  );
};

export default About;
