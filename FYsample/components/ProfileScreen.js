import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";
import config from "../config";

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { userPosts, fetchUserPosts, deletePost, updatePost } = usePost();
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchUserPosts();
    } catch (err) {
      console.error("Error loading posts:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserPosts();
    } catch (err) {
      console.error("Error refreshing posts:", err);
      setError("Failed to refresh posts");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result?.success !== false) {
      navigation.reset({
        index: 0,
        routes: [{ name: "SignIn" }],
      });
    }
  };

  const handleDeletePost = async (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const result = await deletePost(postId);
          if (result.success) {
            loadPosts();
          } else {
            Alert.alert("Error", result.message || "Failed to delete post");
          }
        },
      },
    ]);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditDescription(post.description);
    setEditTags(post.tags.join(", "));
  };

  const handleUpdatePost = async () => {
    const result = await updatePost(editingPost._id, {
      title: editTitle,
      description: editDescription,
      tags: editTags.split(",").map((tag) => tag.trim()),
    });

    if (result.success) {
      setEditingPost(null);
      loadPosts();
    } else {
      Alert.alert("Error", result.message || "Failed to update post");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPosts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Profile</Text>
      </View>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.profileInfo}>
          <Text style={styles.profileText}>Username: {user.username}</Text>
          <Text style={styles.profileText}>Phone Number: {user.phoneNumber}</Text>
          <Text style={styles.profileText}>
            Roll Number: {user.aadharNumber}
          </Text>
          <Text style={styles.profileText}>Email: {user.email}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.userPosts}>
          <Text style={styles.postsHeader}>Your Reports</Text>
          {userPosts.length === 0 ? (
            <Text style={styles.noPosts}>No reports yet</Text>
          ) : (
            userPosts.map((post) => (
              <TouchableOpacity
                key={post._id}
                onPress={() => navigation.navigate("PostDetails", { post })}
                style={styles.postItem}
              >
                <Image
                  source={{ uri: post.image }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
                <View style={styles.postContent}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postDescription} numberOfLines={2}>
                    {post.description}
                  </Text>
                  <Text style={styles.postLocation}>
                    📍 {post.location.address}
                  </Text>
                  <Text
                    style={[
                      styles.postStatus,
                      {
                        color:
                          post.status === "pending"
                            ? "#FFA500"
                            : post.status === "in-progress"
                            ? "#007AFF"
                            : "#28a745",
                      },
                    ]}
                  >
                    Status: {post.status}
                  </Text>
                </View>
                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditPost(post)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeletePost(post._id)}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <Modal
          visible={!!editingPost}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setEditingPost(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Edit Report</Text>
              <TextInput
                style={styles.input}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Title"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Description"
                multiline
                numberOfLines={4}
              />
              <TextInput
                style={styles.input}
                value={editTags}
                onChangeText={setEditTags}
                placeholder="Tags (comma-separated)"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditingPost(null)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdatePost}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    width: "100%",
    backgroundColor: "#E5E9F2",
    paddingTop: 48,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    color: "#235DFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#E5E9F2",
    marginTop: 80, // Add this to account for the header
    padding: 20,
    paddingBottom: 200,
  },
  profileInfo: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileText: {
    fontSize: 16,
    marginVertical: 8,
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#ff4444",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  userPosts: {
    flex: 1,
    marginBottom: 100,
  },
  postsHeader: {
    fontSize: 24,
    fontWeight: "600",
    color: "#235DFF",
    marginBottom: 20,
  },
  postItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: 200,
  },
  postContent: {
    padding: 15,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  postDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  postLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  postStatus: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#235DFF",
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f8f8f8",
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#007AFF",
  },
  deleteButton: {
    backgroundColor: "#ff4444",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#28a745",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  retryButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
  },
  noPosts: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
});

export default ProfileScreen;
