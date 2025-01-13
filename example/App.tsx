import { StyleSheet, Text, View } from 'react-native';
import { WFButton } from '@whisper-flow-app/ui';

export default function App() {
  const onPress = () => {
    console.log('Button pressed');
  };
  return (
    <View style={styles.container}>
      <Text>size</Text>
      <WFButton onPress={onPress} size='small'>按钮</WFButton>
      <WFButton onPress={onPress} size='medium'>按钮</WFButton>
      <WFButton onPress={onPress} size='large'>按钮</WFButton>
      <WFButton loading>按钮</WFButton>
      <WFButton size='medium'>按钮</WFButton>
      <WFButton size='large'>按钮</WFButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
