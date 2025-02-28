import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import config from "../config";

const Reports = () => {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportedPosts = async () => {
    try {
      const response = await fetch(`${config.API_URL}/admin/reported-posts`, {
        credentials: "include",
      });
      const data = await response.json();
      setReportedPosts(data);
    } catch (error) {
      console.error("Error fetching reported posts:", error);
      Alert.alert("Error", "Failed to fetch reported posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedPosts();
  }, []);

  const handleDeletePost = async (postId) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${config.API_URL}/admin/posts/${postId}`,
                {
                  method: "DELETE",
                  credentials: "include",
                }
              );

              if (response.ok) {
                setReportedPosts((prev) =>
                  prev.filter((post) => post._id !== postId)
                );
                Alert.alert("Success", "Post deleted successfully");
              } else {
                Alert.alert("Error", "Failed to delete post");
              }
            } catch (error) {
              console.error("Error deleting post:", error);
              Alert.alert("Error", "Failed to delete post");
            }
          },
        },
      ]
    );
  };

  const handleIgnoreReports = async (postId) => {
    Alert.alert(
      "Ignore Reports",
      "Are you sure you want to clear all reports for this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Reports",
          onPress: async () => {
            try {
              const response = await fetch(
                `${config.API_URL}/admin/posts/${postId}/clear-reports`,
                {
                  method: "POST",
                  credentials: "include",
                }
              );

              if (response.ok) {
                setReportedPosts((prev) =>
                  prev.filter((post) => post._id !== postId)
                );
                Alert.alert("Success", "Reports cleared successfully");
              } else {
                Alert.alert("Error", "Failed to clear reports");
              }
            } catch (error) {
              console.error("Error clearing reports:", error);
              Alert.alert("Error", "Failed to clear reports");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.reportCount}>Reports: {item.reportCount}</Text>
      </View>
      <Text style={styles.postDescription}>{item.description}</Text>
      <Text style={styles.reportLabel}>Recent Reports:</Text>
      {item.reports.slice(-3).map((report, index) => (
        <Text key={index} style={styles.reportReason}>
          • {report.reason}
        </Text>
      ))}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDeletePost(item._id)}
        >
          <MaterialIcons name="delete" size={20} color="white" />
          <Text style={styles.buttonText}>Delete Post</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.ignoreButton]}
          onPress={() => handleIgnoreReports(item._id)}
        >
          <MaterialIcons name="not-interested" size={20} color="white" />
          <Text style={styles.buttonText}>Ignore Reports</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {reportedPosts.length > 0 ? (
        <FlatList
          data={reportedPosts}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noReports}>No reported posts to review</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  reportCount: {
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
  },
  postDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  reportReason: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 4,
    flex: 0.48,
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  ignoreButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "white",
    marginLeft: 4,
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noReports: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});

export default Reports;

