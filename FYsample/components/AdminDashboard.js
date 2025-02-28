import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import config from "../config";

const AdminDashboard = () => {
  const navigation = useNavigation();
  const [reportedPosts, setReportedPosts] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch reported posts
      const postsResponse = await fetch(
        `${config.API_URL}/admin/reported-posts`,
        {
          credentials: "include",
        }
      );
      const postsData = await postsResponse.json();
      setReportedPosts(postsData);

      // Fetch stats
      const statsResponse = await fetch(`${config.API_URL}/admin/stats`, {
        credentials: "include",
      });
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to fetch dashboard data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleDeletePost = async (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
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
    ]);
  };

  const handleClearReports = async (postId) => {
    Alert.alert(
      "Clear Reports",
      "Are you sure you want to clear all reports for this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
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

  const menuItems = [
    {
      title: "Reported Posts",
      icon: "report-problem",
      onPress: () => navigation.navigate("Reports"),
      description: "View and manage posts with 5+ reports",
      count: reportedPosts.length || 0,
      color: "#FF3B30",
    },
    {
      title: "All Posts",
      icon: "list",
      onPress: () => navigation.navigate("AllPosts"),
      description: `Total posts: ${stats.totalPosts}`,
      color: "#007AFF",
    },
    {
      title: "Users",
      icon: "people",
      onPress: () => navigation.navigate("Users"),
      description: `Total users: ${stats.totalUsers}`,
      color: "#34C759",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.welcomeText}>Manage your application</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemContent}>
              <MaterialIcons name={item.icon} size={24} color={item.color} />
              <View style={styles.menuItemText}>
                <View style={styles.titleContainer}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  {item.count > 0 && (
                    <View
                      style={[styles.badge, { backgroundColor: item.color }]}
                    >
                      <Text style={styles.badgeText}>{item.count}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.menuItemDescription}>
                  {item.description}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#999" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reported Posts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reported Posts</Text>
        {reportedPosts.length === 0 ? (
          <Text style={styles.noReports}>No reported posts to review</Text>
        ) : (
          reportedPosts.map((post) => (
            <View key={post._id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <View style={styles.reportBadge}>
                  <Text style={styles.reportCount}>
                    {post.reportCount} Reports
                  </Text>
                </View>
              </View>
              <Text style={styles.postDescription} numberOfLines={2}>
                {post.description}
              </Text>
              <Text style={styles.reportLabel}>Recent Reports:</Text>
              {post.reports.slice(-3).map((report, index) => (
                <Text key={index} style={styles.reportReason}>
                  • {report.reason}
                </Text>
              ))}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => handleDeletePost(post._id)}
                >
                  <MaterialIcons name="delete" size={20} color="white" />
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.clearButton]}
                  onPress={() => handleClearReports(post._id)}
                >
                  <MaterialIcons name="clear-all" size={20} color="white" />
                  <Text style={styles.buttonText}>Clear Reports</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
  },
  menuContainer: {
    padding: 15,
  },
  menuItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  menuItemText: {
    flex: 1,
    marginLeft: 15,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#666",
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  postCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  reportBadge: {
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportCount: {
    color: "#FF3B30",
    fontSize: 12,
    fontWeight: "bold",
  },
  postDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  reportReason: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    flex: 0.48,
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  clearButton: {
    backgroundColor: "#8E8E93",
  },
  buttonText: {
    color: "white",
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "500",
  },
  noReports: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 20,
  },
});

export default AdminDashboard;
