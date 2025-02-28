import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const OnboardingScreen = ({ navigation, slides }) => {
  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
        <View style={styles.imageContainer}>
          <Image style={styles.img} source={item.image} />
        </View>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.replace('SignIn')}
        >
          <View style={styles.skipText}>
            <Text style={{ color: 'white' }}>Skip</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <AppIntroSlider
      renderItem={renderItem}
      data={slides}
      onDone={() => navigation.replace('SignIn')}
      showSkipButton={false}
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'blue',
  },
  title: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#326BDF',
    padding: 20,
    paddingTop: 250,
    textAlign: 'center',
    fontFamily: 'Think',
  },
  text: {
    position: 'absolute',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#59606E',
    paddingHorizontal: 20,
    paddingTop: 380,
    padding: 20,
    fontFamily: 'Think',
  },
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
    zIndex: 0,
    width: 65,
    height: 40,
    borderRadius: 12,
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    height: 500,
    backgroundColor: '#D6C6BB',
    top: 0,
    position: 'absolute',
    borderBottomLeftRadius: 130,
    borderBottomRightRadius: 130,
    overflow: 'hidden',
  },
  img: {
    width: '100%', // Covers the entire width of the half-oval
    height: '100%', // Covers the entire height of the half-oval
    resizeMode: 'cover', // Adjusts the image to cover the area
  },
});

export default OnboardingScreen;
