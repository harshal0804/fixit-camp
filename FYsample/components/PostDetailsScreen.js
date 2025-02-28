import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Modal,
  Platform,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "react-native-vector-icons";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";
import MapView, { Marker } from 'react-native-maps';

const PostDetailsScreen = ({ route }) => {
  const { post: initialPost } = route.params;
  const { user } = useAuth();
  const {
    upvotePost,
    downvotePost,
    reportPost,
    checkReportStatus,
  } = usePost();
  const [post, setPost] = useState(initialPost);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return '#FFB800'; // Yellow
      case 'in-progress':
        return '#235DFF'; // Blue
      case 'resolved':
        return '#22C55E'; // Green
      default:
        return '#94A3B8'; // Gray
    }
  };

  const handleUpvote = async () => {
    const hasUpvoted = post.upvotes.includes(user._id);
    const hasDownvoted = post.downvotes.includes(user._id);

    if (hasUpvoted) {
      // Remove upvote
      setPost((prevPost) => ({
        ...prevPost,
        upvotes: prevPost.upvotes.filter((id) => id !== user._id),
      }));
    } else {
      // Add upvote and remove downvote if exists
      if (hasDownvoted) {
        setPost((prevPost) => ({
          ...prevPost,
          downvotes: prevPost.downvotes.filter((id) => id !== user._id),
        }));
      }
      const result = await upvotePost(post._id);
      if (result.success) {
        setPost((prevPost) => ({
          ...prevPost,
          upvotes: [...prevPost.upvotes, user._id],
        }));
      } else {
        Alert.alert("Error", result.message || "Failed to upvote");
      }
    }
  };

  const handleDownvote = async () => {
    const hasDownvoted = post.downvotes.includes(user._id);
    const hasUpvoted = post.upvotes.includes(user._id);

    if (hasDownvoted) {
      // Remove downvote
      setPost((prevPost) => ({
        ...prevPost,
        downvotes: prevPost.downvotes.filter((id) => id !== user._id),
      }));
    } else {
      // Add downvote and remove upvote if exists
      if (hasUpvoted) {
        setPost((prevPost) => ({
          ...prevPost,
          upvotes: prevPost.upvotes.filter((id) => id !== user._id),
        }));
      }
      const result = await downvotePost(post._id);
      if (result.success) {
        setPost((prevPost) => ({
          ...prevPost,
          downvotes: [...prevPost.downvotes, user._id],
        }));
      } else {
        Alert.alert("Error", result.message || "Failed to downvote");
      }
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this issue: ${post.title}\n${
          post.description
        }\nLocation: ${post.location?.address || "No address provided"}`,
        title: post.title,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share post");
    }
  };

  // For Android, show a custom modal. On iOS, use Alert.prompt.
  const handleReport = () => {
    if (Platform.OS === "android") {
      setReportModalVisible(true);
    } else {
      Alert.prompt(
        "Report Post",
        "Please provide a reason for reporting this post:",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Submit",
            onPress: async (reason) => {
              if (!reason || reason.trim() === "") {
                Alert.alert("Error", "Please provide a reason for reporting");
                return;
              }
              const result = await reportPost(post._id, reason.trim());
              if (result.success) {
                Alert.alert(
                  "Success",
                  result.message || "Post reported successfully"
                );
              } else {
                Alert.alert("Error", result.message);
              }
            },
          },
        ],
        "plain-text",
        "",
        "default"
      );
    }
  };

  // Submit function for the Android custom modal
  const submitReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert("Error", "Please provide a reason for reporting");
      return;
    }
    const result = await reportPost(post._id, reportReason.trim());
    if (result.success) {
      Alert.alert("Success", result.message || "Post reported successfully");
    } else {
      Alert.alert("Error", result.message);
    }
    setReportModalVisible(false);
    setReportReason("");
  };

  const checkReports = async () => {
    const status = await checkReportStatus(post._id);
    if (status) {
      Alert.alert(
        "Report Status",
        `Reports: ${status.reportCount}\nThreshold: ${
          status.reportsThreshold
        }\nExceeds Threshold: ${
          status.exceedsThreshold ? "Yes" : "No"
        }\n\nRecent Reports: ${status.reports
          .slice(-3)
          .map((r) => `\n- ${r.reason}`)
          .join("")}`
      );
    }
  };


  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: post.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>
            {post.category || "Uncategorized"}
          </Text>
        </View>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>
        <Text style={styles.location}>
          📍 {post.location?.address || "No address provided"}
        </Text>
        <Text style={styles.author}>
          Posted by: {post.username || "Anonymous User"}
        </Text>
        <Text style={styles.date}>
          {new Date(post.createdAt).toLocaleDateString()}
        </Text>

        <View style={styles.interactionBar}>
          <View style={styles.voteContainer}>
            <TouchableOpacity onPress={handleUpvote} style={styles.voteButton}>
              <Ionicons
                name={post.upvotes?.includes(user?._id) ? "chevron-up" : "chevron-up-outline"}
                size={24}
                color={post.upvotes?.includes(user?._id) ? "#235DFF" : "#64748B"}
              />
              <Text style={[
                styles.voteCount,
                post.upvotes?.includes(user?._id) && styles.activeVoteCount
              ]}>
                {post.upvotes?.length || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDownvote} style={styles.voteButton}>
              <Ionicons
                name={post.downvotes?.includes(user?._id) ? "chevron-down" : "chevron-down-outline"}
                size={24}
                color={post.downvotes?.includes(user?._id) ? "#FF4444" : "#64748B"}
              />
              <Text style={[
                styles.voteCount,
                post.downvotes?.includes(user?._id) && styles.activeDownvoteCount
              ]}>
                {post.downvotes?.length || 0}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={22} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReport} style={styles.actionButton}>
              <Ionicons name="flag-outline" size={22} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={checkReports}>
              <Ionicons name="information-circle-outline" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status: </Text>
          <View style={[styles.statusTag, { backgroundColor: getStatusColor(post.status) }]}>
            <Text style={styles.statusText}>{post.status || 'Pending'}</Text>
          </View>
        </View>

        {/* Add Map View */}
        {post.location && (
          <View style={styles.mapContainer}>
            <Text style={styles.mapTitle}>Location:</Text>
            <View style={styles.mapWrapper}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: parseFloat(post.location.latitude) || 0,
                  longitude: parseFloat(post.location.longitude) || 0,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={true}
              >
                <Marker
                  coordinate={{
                    latitude: parseFloat(post.location.latitude) || 0,
                    longitude: parseFloat(post.location.longitude) || 0,
                  }}
                  title={post.title}
                  description={post.location.address}
                />
              </MapView>
            </View>
          </View>
        )}
      </View>

      {/* Custom Modal for Android Report Prompt */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Report Post</Text>
            <Text style={styles.modalDescription}>
              Please provide a reason for reporting this post:
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter reason here"
              value={reportReason}
              onChangeText={setReportReason}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setReportModalVisible(false);
                  setReportReason("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={submitReport}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  content: {
    padding: 15,
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 10,
  },
  categoryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#235DFF",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    color: "#333",
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  author: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: "#999",
    marginBottom: 15,
  },
  interactionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  voteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  voteCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  activeVoteCount: {
    color: "#235DFF",
  },
  activeDownvoteCount: {
    color: "#FF4444",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  statusContainer: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
  },
  statusTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
    lineHeight: 16,
  },
  mapContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  mapWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  // Modal Styles for Android
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    marginLeft: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
});

export default PostDetailsScreen;
