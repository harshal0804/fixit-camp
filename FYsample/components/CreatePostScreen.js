import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";
import { usePost } from "../context/PostContext";

const CATEGORIES = [
  "Technical",
  "Parking",
  "Electrical & Lighting",
  "Academics & Administration",
  "Sanitation",
  "Others",
];

const CAMPUS_POLYGON = [
  [19.022028, 72.869722], // Northwest
  [19.021528, 72.872333], // Northeast
  [19.0211667, 72.8722222], 
  [19.020861, 72.871222], // Southeast
  [19.0205556, 72.8705556], 
  [19.020833, 72.869556], // Southwest
  [19.022028, 72.869722], // Close polygon
];

const isPointInPolygon = (point, polygon) => {
  const x = point.latitude;
  const y = point.longitude;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const CreatePostScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const { createPost } = usePost();

  const [mapRegion, setMapRegion] = useState({
    latitude: 19.021363,
    longitude: 72.870755,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  });

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Camera roll permissions required!");
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        base64: true,
        quality: 0.5,
      });

      if (!result.canceled) {
        let base64Image;
        if (result.assets[0].base64) {
          base64Image = result.assets[0].base64;
        } else {
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          base64Image = base64;
        }
        setImage(`data:image/jpeg;base64,${base64Image}`);
      }
    } catch (error) {
      alert("Error picking image");
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Location permission required");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const userPoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      if (!isPointInPolygon(userPoint, CAMPUS_POLYGON)) {
        alert("You must be on campus to submit reports");
        return;
      }

      const address = await Location.reverseGeocodeAsync({
        latitude: userPoint.latitude,
        longitude: userPoint.longitude,
      });

      const locationData = {
        ...userPoint,
        address: address[0] ? 
          `${address[0].name || ''} ${address[0].street || ''}, ${address[0].city || ''}`.trim() 
          : "Campus Location"
      };

      setLocation(locationData);
      setMapRegion({
        ...userPoint,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });

    } catch (error) {
      alert("Error getting location");
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !image || !location) {
      alert("Please fill all required fields");
      return;
    }

    if (!isPointInPolygon(location, CAMPUS_POLYGON)) {
      alert("Location must be within campus boundaries");
      return;
    }

    const postData = {
      title,
      description,
      image,
      location,
      category,
      tags: tags.split(",").map(tag => tag.trim()),
    };

    try {
      const result = await createPost(postData);
      if (result.success) {
        navigation.navigate("Profile");
        alert("Report submitted successfully!");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert(error.message || "Submission failed");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Create New Report</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: 60 }}>
          <TextInput
            style={styles.input}
            placeholder="Report Title"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detailed Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Category:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                dropdownIconColor="#333"
              >
                {CATEGORIES.map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.buttonText}>Attach Photo</Text>
          </TouchableOpacity>
          {image && <Image source={{ uri: image }} style={styles.preview} />}

          <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
            <Text style={styles.buttonText}>Set Location</Text>
          </TouchableOpacity>

          {location && (
            <>
              <Text style={styles.locationText}>
                📍 {location.address}
              </Text>
              <View style={styles.mapContainer}>
                <MapView style={styles.map} region={mapRegion}>
                  <Marker
                    coordinate={location}
                    title="Report Location"
                    description={location.address}
                  />
                </MapView>
              </View>
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Tags (comma separated)"
            value={tags}
            onChangeText={setTags}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E9F2",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    backgroundColor: "#E5E9F2",
    padding: 20,
    zIndex: 1000,
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    color: "#235DFF",
    marginTop: 28,
  },
  contentContainer: {
    marginTop: 40,
    padding: 25,
    paddingBottom: 100,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  imageButton: {
    backgroundColor: "#235DFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  locationButton: {
    backgroundColor: "#235DFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  preview: {
    width: "100%",
    height: 200,
    marginBottom: 15,
    borderRadius: 8,
  },
  locationText: {
    marginBottom: 10,
    color: "#666",
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 15,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  submitButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CreatePostScreen;