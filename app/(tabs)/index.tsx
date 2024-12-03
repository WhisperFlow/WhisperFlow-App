import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
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
  const [isAllowRecord, setAllowRecord] = useState("undetermined");

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const response = await Audio.requestPermissionsAsync();
        // console.log("Permissions response", response);
        // setAllowRecord(response.status);
      } catch (error) {
        // setAllowRecord('error');
        // console.error("Failed to get permissions", error);
      }
    };

    requestPermissions();
  }, []);

  const tap = Gesture.LongPress()
    .onBegin(() => {
      pressed.value = true;
    })
    .onFinalize(() => {
      pressed.value = false;
    });

  const animatedStyles = useAnimatedStyle(() => ({
    backgroundColor: pressed.value ? '#CC3363' : '#B58DF1',
    transform: [{ scale: withTiming(pressed.value ? 1.2 : 1) }],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <GestureDetector gesture={tap}>
          <Animated.View style={[styles.circle, animatedStyles]} />
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
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
});
