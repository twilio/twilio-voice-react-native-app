import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export type Props = { delayMs?: number };

const IncomingCall: React.FC<Props> = ({ delayMs = 500 }) => {
  const [doAnimate, setDoAnimate] = React.useState<boolean>(false);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDoAnimate(true);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [delayMs]);

  return (
    <View style={styles.container}>
      {doAnimate ? <ActivityIndicator size="large" /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
  },
  test: {
    backgroundColor: 'blue',
  },
});

export default IncomingCall;
