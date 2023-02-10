import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { RecipientType } from '../../types';

export type Props = {
  outgoingPstn: string;
  outgoingIdentity: string;
  recipientType: RecipientType;
  setOutgoingIdentity: (id: string) => void;
};

const OutgoingRemoteParticipant: React.FC<Props> = ({
  outgoingPstn,
  outgoingIdentity,
  recipientType,
  setOutgoingIdentity,
}) => {
  const formattedPstn = React.useMemo(() => {
    return outgoingPstn.length > 0 ? `+${outgoingPstn}` : '';
  }, [outgoingPstn]);
  return (
    <View style={styles.container}>
      {recipientType === 'client' ? (
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
