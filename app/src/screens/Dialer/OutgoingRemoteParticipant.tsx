import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export type Props = {
  isOutgoingClient: boolean;
  setOutgoingIdentity: (id: string) => void;
  outgoingPstn: string;
  outgoingIdentity: string;
};

const OutgoingRemoteParticipant: React.FC<Props> = ({
  isOutgoingClient,
  setOutgoingIdentity,
  outgoingPstn,
  outgoingIdentity,
}) => {
  const formattedPstn = React.useMemo(() => {
    return outgoingPstn.length > 0 ? `+${outgoingPstn}` : '';
  }, [outgoingPstn]);
  return (
    <View style={styles.container}>
      {isOutgoingClient ? (
        <TextInput
          autoFocus={true}
          defaultValue={outgoingIdentity}
          onChangeText={setOutgoingIdentity}
          style={styles.title}
        />
      ) : (
        <Text style={pstnStyle}>{formattedPstn}</Text>
      )}
      <Text style={styles.subtitle} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  title: {
    color: 'black',
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    color: 'black',
    fontSize: 12,
    textAlign: 'center',
  },
  pstn: {
    padding: 10.5,
  },
});

const pstnStyle = {
  ...styles.title,
  ...styles.pstn,
};

export default OutgoingRemoteParticipant;
