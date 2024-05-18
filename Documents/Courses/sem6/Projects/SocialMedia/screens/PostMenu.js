import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PostMenu({ onClose, onDelete, onShare }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
        <Text>Delete</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={onShare}>
        <Text>Share</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <MaterialCommunityIcons name="close" color="#73788B" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  menuItem: {
    paddingVertical: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
