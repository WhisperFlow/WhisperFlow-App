import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, Pressable, Platform, UIManager } from 'react-native';
import { Audio } from "expo-av";

export default function App() {
  const [pressed, setPressed] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isAllowRecord, setAllowRecord] = useState<Audio.PermissionStatus | 'undetermined'>("undetermined");
  const [recordingStatus, setRecordingStatus] = useState<Audio.RecordingStatus | null>(null);

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

    requestPermissions();
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
      console.log(`Recorded URI: ${recording.getURI()}`);
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  };

  /** 播放录音 */
  const playSound = async () => {
    if (!recording || !recordingStatus?.isDoneRecording) return;

    try {
      const { sound } = await recording.createNewLoadedSoundAsync();
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play sound", error);
    }
  };

  const getRecordPath = () => {
    console.log("Recorded URI: ", recording?.getURI());
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
      <Button title="Get Record Path" onPress={getRecordPath} />
      <Button title="Play Sound" onPress={playSound} />
      <View style={styles.container}>
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
          <View style={[styles.circle, animatedStyles]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  circle: {
    height: 120,
    width: 120,
    borderRadius: 500,
  },
  height_100: {
    height: '100%',
  },
});