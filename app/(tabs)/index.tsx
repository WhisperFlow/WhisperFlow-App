import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import { Audio } from "expo-av";

export default function App() {
  const pressed = useSharedValue<boolean>(false);

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
        // setAllowRecord('error');
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

      // 创建并准备录音 
      const newRecording = new Audio.Recording();
      setRecording(newRecording);

      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      newRecording.setOnRecordingStatusUpdate(setRecordingStatus);// 设置录音状态更新的回调函数
      await newRecording.startAsync();
    } catch (error) {
      console.error("Failed to start recording", error);
      // todo: 错误通知
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
      // todo: 错误通知
    }
  };

  /** 播放录音 */
  const playSound = async () => {
    if (!recording || !recordingStatus?.isDoneRecording) return

    try {
      const { sound } = await recording.createNewLoadedSoundAsync();
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play sound", error);
      // todo: 错误通知
    }
  }

  const getRecordPath = () => {
    console.log("Recorded URI: ", recording?.getURI());
  }

  const tap = Gesture.LongPress()
    .onBegin(() => {
      pressed.value = true;
      startRecording();
    })
    .onFinalize(() => {
      pressed.value = false;
      stopRecording();
    });

  const circleColor = useDerivedValue(() => {
    if (isAllowRecord === "granted") {
      return pressed.value ? '#CC3363' : '#B58DF1';
    }
    return '#A9A9A9';
  });

  const animatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: circleColor.value,
      transform: [{ scale: withTiming(pressed.value ? 1.2 : 1) }],
    };
  });


  return (
    <View style={styles.height_100}>
      <Button title="Get Record Path" onPress={getRecordPath} />
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.container}>
          <GestureDetector gesture={tap}>
            <Animated.View style={[styles.circle, animatedStyles]} />
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
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
