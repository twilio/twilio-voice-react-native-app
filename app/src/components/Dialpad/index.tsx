import React from 'react';
import { View, StyleSheet } from 'react-native';
import DialpadButton, {
  type Props as DialpadButtonProps,
} from './DialpadButton';

const DIALPAD_DATA: [string, string][][] = [
  [
    ['1', ''],
    ['2', 'abc'],
    ['3', 'def'],
  ],
  [
    ['4', 'ghi'],
    ['5', 'jkl'],
    ['6', 'mno'],
  ],
  [
    ['7', 'pqrs'],
    ['8', 'tuv'],
    ['9', 'wxyz'],
  ],
  [
    ['*', ''],
    ['0', '.'],
    ['#', ''],
  ],
];

export type Props = {
  data?: [string, string][][];
  onPress?: (value: string) => void;
} & Pick<DialpadButtonProps, 'disabled'>;

const Dialpad: React.FC<Props> = ({
  disabled,
  onPress,
  data = DIALPAD_DATA,
}) => {
  const mapCol = React.useCallback(
    ([title, subtitle]: [string, string], buttonIdx: number) => {
      const handle = onPress && (() => onPress(title));
      return (
        <View key={buttonIdx} style={styles.button}>
          <DialpadButton
            disabled={disabled}
            title={title}
            subtitle={subtitle}
            onPress={handle}
          />
        </View>
      );
    },
    [disabled, onPress],
  );

  const mapRow = React.useCallback(
    (rowData: [string, string][], rowIdx: number) => (
      <View key={rowIdx} style={styles.row}>
        {rowData.map(mapCol)}
      </View>
    ),
    [mapCol],
  );

  return (
    <View style={styles.container}>
      {React.useMemo(() => data.map(mapRow), [data, mapRow])}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
});

export default Dialpad;
