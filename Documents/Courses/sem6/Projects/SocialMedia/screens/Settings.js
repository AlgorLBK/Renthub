// import React from 'react';
// import { View, Text } from 'react-native';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard } from "react-native";
import React, { useState } from "react";
import {firebase} from '../config/firebase'


export default function Settings() {
  // const todoRef = firebase.firestore().collection('testData');
  // const data = {
  //   heading: "first try",
  //   createdAt: firebase.firestore.FieldValue.serverTimestamp()
  // }
  // const ajouter = () => todoRef.add(data);
  // ajouter();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}