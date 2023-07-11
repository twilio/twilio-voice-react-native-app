import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Linking,
  TouchableHighlight,
} from 'react-native';
import { getEnvVariable } from '../../util/env';
import packageJson from '../../../package.json';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F4F6',
    height: '100%',
    display: 'flex',
    flex: 1,
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
  body: { flex: 1 },
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

  const handlePress = async () => {
    await Linking.openURL(slackURL);
  };

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.section}>
          <Text style={styles.header}>About</Text>
          <Text>This app is maintained by the Twilio Voice Access group</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.issueDescription}>
            <Text style={styles.header}>Report an Issue</Text>
            <Text>For issues or bugs please reach out in the </Text>
            <TouchableHighlight onPress={handlePress}>
              <Text style={styles.channel}>{slackChannelName}</Text>
            </TouchableHighlight>
            <Text> slack channel</Text>
          </View>
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
