import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

const SkipButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.skipButton} onPress={onPress}>
      <View style={styles.skipText}>
        <Text style={{ color: 'white' }}>Skip</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  skipText: {
    backgroundColor: '#326BDF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 65,
    height: 40,
    borderRadius: 12,
    fontSize: 16,
  },
});

export default SkipButton;
