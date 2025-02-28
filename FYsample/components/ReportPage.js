import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";

const exampleImage = require("../assets/simple-issue.png"); // Replace with your image URL

const ReportPage = ({ route }) => {
  if (!route || !route.params) {
    return <Text>Error: No data found</Text>;
  }
  // Destructure post data passed via navigation
  const { title, image, description, hashtags } = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Post Image */}
      <Image source={image || exampleImage} style={styles.image} />

      {/* Post Description */}
      <Text style={styles.description}>{description}</Text>

      {/* Post Hashtags */}
      {Array.isArray(hashtags) && hashtags.map((hashtag, index) => (
        <Text key={index} style={styles.hashtags}>#{hashtag}</Text>
      ))}

      {/* Blank Space */}
      <View style={styles.blankSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  image: {
    width: Dimensions.get("window").width - 30, // Dynamic width
    height: 400,
    borderRadius: 10,
    resizeMode: "cover",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
    marginBottom: 15,
  },
  hashtags: {
    fontSize: 14,
    fontWeight: "400",
    color: "#007AFF",
    marginBottom: 15,
  },
  blankSpace: {
    height: 100, // Blank space for scrollability
  },
});

export default ReportPage;
