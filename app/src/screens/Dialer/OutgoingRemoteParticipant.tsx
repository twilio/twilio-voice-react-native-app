import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { type RecipientType } from '../../store/voice/call/outgoingCall';

export type Props = {
  outgoingNumber: string;
  outgoingIdentity: string;
  recipientType: RecipientType;
  setOutgoingIdentity: (id: string) => void;
};

const OutgoingRemoteParticipant: React.FC<Props> = ({
  outgoingNumber,
  outgoingIdentity,
  recipientType,
  setOutgoingIdentity,
}) => {
  const formattedNumber = React.useMemo(() => {
    return outgoingNumber.length > 0 ? `+${outgoingNumber}` : '';
  }, [outgoingNumber]);
  return (
    <View style={styles.container}>
      {recipientType === 'client' ? (
        <TextInput
          autoFocus={true}
          defaultValue={outgoingIdentity}
          onChangeText={setOutgoingIdentity}
          style={styles.title}
          testID="client_text_input"
        />
      ) : (
        <Text style={numberStyle} testID="formatted_number">
          {formattedNumber}
        </Text>
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
  number: {
    padding: 10.5,
  },
});

const numberStyle = {
  ...styles.title,
  ...styles.number,
};

export default OutgoingRemoteParticipant;
