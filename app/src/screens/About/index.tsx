import React from 'react';
import { StyleSheet, Text, View, Linking } from 'react-native';
import { getEnvVariable } from '../../util/env';
import packageJson from '../../../package.json';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F4F6',
    height: '100%',
    display: 'flex',
    flex: 1,
    alignContent: 'center',
    marginTop: 50,
    marginHorizontal: 40,
  },
  header: {
    color: '#121C2D',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  body: { flex: 1 },
  section: {
    marginBottom: 50,
  },
  highlight: {
    color: '#0263E0',
  },
  link: {
    color: '#0263E0',
    textDecorationLine: 'underline',
  },
  textSection: {
    marginBottom: 10,
  },
  label: {
    fontWeight: '700',
  },
  footer: {
    height: 50,
  },
});

const About: React.FC = () => {
  const slackURL = React.useMemo(() => {
    return getEnvVariable('SLACK_URL');
  }, []);
  const slackChannelName = React.useMemo(() => {
    return `#${getEnvVariable('SLACK_CHANNEL_NAME')}`;
  }, []);
  const GIT_PROJECT_URL =
    'https://github.com/twilio/twilio-voice-react-native-app';

  const handleSlackChannelPress = async () => {
    await Linking.openURL(slackURL);
  };

  const handleGitProjectPress = async () => {
    await Linking.openURL(GIT_PROJECT_URL);
  };

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.section}>
          <Text style={styles.header}>About</Text>
          <Text style={styles.textSection}>
            To get started use the Dialer, and make either a PTSN or Client
            outgoing call.
          </Text>
          <Text style={styles.textSection}>
            This project consists of a backend server and a React Native app
            that demonstrate best practices for developing a Twilio Programmable
            Voice application.
          </Text>
          <Text>
            Find us on{' '}
            <Text onPress={handleGitProjectPress} style={styles.link}>
              GitHub
            </Text>
            !
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.header}>Report an Issue</Text>
          <Text>
            <Text>
              This app is maintained by the Twilio Voice Access group. For
              issues, bugs, or product feedback please reach out to us on Slack{' '}
            </Text>
            <Text onPress={handleSlackChannelPress} style={styles.link}>
              {slackChannelName}
            </Text>
            <Text>. If you're technically inclined, please submit a </Text>
            <Text onPress={handleGitProjectPress} style={styles.link}>
              pull request
            </Text>
            <Text> (this project is open source!)</Text>
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text>
          <Text style={styles.label}>Version </Text>
          <Text>{packageJson.version}</Text>
        </Text>
      </View>
    </View>
  );
};

export default About;
