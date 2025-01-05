import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, Pressable, Text, FlatList } from 'react-native';
import { Audio } from "expo-av";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getContentUriAsync, getInfoAsync, readAsStringAsync } from 'expo-file-system';

export default function App() {
  const [pressed, setPressed] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isAllowRecord, setAllowRecord] = useState<Audio.PermissionStatus | 'undetermined'>("undetermined");
  const [recordingStatus, setRecordingStatus] = useState<Audio.RecordingStatus | null>(null);
  const [recordList, setRecordings] = useState<{ uri: string; name: string; type: string }[]>([]);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const response = await Audio.requestPermissionsAsync();
        console.log("Permissions response", response);
        setAllowRecord(response.status);
      } catch (error) {
        console.error("Failed to get permissions", error);
      }
    };

    const loadRecordings = async () => {
      try {
        const storedUris = await AsyncStorage.getItem("recorded-uris");
        if (storedUris) {
          const recordList = JSON.parse(storedUris);
          console.log("Record list", recordList[0]);
          console.log("Record 1", await getInfoAsync(recordList[0].uri));

          // const recordFile = await readAsStringAsync(recordList[0].uri, { encoding: 'base64' });
          // console.log("Recording stopped and stored at", recordFile);
          setRecordings(JSON.parse(storedUris));
        }
      } catch (error) {
        console.error("Failed to load recordList", error);
      }
    };

    requestPermissions();
    loadRecordings();
  }, []);

  /** 开始录音 */
  const startRecording = async () => {
    try {
      if (recording && recordingStatus?.canRecord) {
        await recording.startAsync();
        return;
      }
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: true,
      });

      const newRecording = new Audio.Recording();
      setRecording(newRecording);

      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      newRecording.setOnRecordingStatusUpdate(setRecordingStatus);
      await newRecording.startAsync();
    } catch (error) {
      console.error("Failed to start recording", JSON.stringify(error));
    }
  };

  /** 停止录音 */
  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        const recordingUri = {
          uri: uri,
          name: `recording-${Date.now()}.m4a`,
          type: "audio/m4a",
        };

        const storedUris = await AsyncStorage.getItem("recorded-uris");
        const uriList = storedUris ? JSON.parse(storedUris) : [];

        uriList.push(recordingUri);
        await AsyncStorage.setItem("recorded-uris", JSON.stringify(uriList));
        setRecordings(uriList); // 更新录音列表
      }

    } catch (error) {
      console.error("Failed to stop recording", JSON.stringify(error));
    }
  };

  /** 播放录音 */
  const playSound = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play sound", error);
    }
  };

  /** 删除录音 */
  const deleteRecording = async (uri: string) => {
    try {
      const updatedList = recordList.filter(record => record.uri !== uri);
      setRecordings(updatedList);
      await AsyncStorage.setItem("recorded-uris", JSON.stringify(updatedList));
    } catch (error) {
      console.error("Failed to delete recording", error);
    }
  };

  const circleColor = () => {
    if (isAllowRecord === "granted") {
      return pressed ? '#CC3363' : '#B58DF1';
    }
    return '#A9A9A9';
  };

  const animatedStyles = {
    backgroundColor: circleColor(),
    transform: [{ scale: pressed ? 1.2 : 1 }],
  };

  const onPressIn = () => {
    setPressed(true);
    startRecording();
  };

  const onPressOut = () => {
    setPressed(false);
    stopRecording();
  };

  return (
    <View style={styles.height_100}>
      <View style={styles.container}>
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
          <View style={[styles.circle, animatedStyles]} />
        </Pressable>
      </View>
      {recordList.length > 0 &&
        <FlatList
          data={recordList}
          keyExtractor={(item) => item.uri}
          renderItem={({ item }) => (
            <View style={styles.recordingItem}>
              <Text>{item.name}</Text>
              <View style={styles.actions}>
                <View style={styles.buttonContainer}>
                  <Button title="Delete" onPress={() => deleteRecording(item.uri)} />
                </View>
                <View style={styles.buttonContainer}>
                  <Button title="Play" onPress={() => playSound(item.uri)} />
                </View>
              </View>
            </View>
          )}
          style={styles.flatList}
        />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    height: 120,
    width: 120,
    borderRadius: 500,
  },
  height_100: {
    height: '100%',
  },
  flatList: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    height: '50%',
  },
  recordingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  actions: {
    flexDirection: 'row',
  },
  buttonContainer: {
    marginHorizontal: 5,
  },
});