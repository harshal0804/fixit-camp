import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { usePost } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import SearchBar from "./SearchBar";
import { Ionicons } from "react-native-vector-icons";

const exampleImage = require("../assets/simple-issue.png"); // Replace with your image URL

// Import or define categories
const CATEGORIES = [
  "All",
  "Technical",
  "Parking",
  "Electrical & Lighting",
  "Sanitation",
  "Academics & Administration",
  "Others",
];

const HomeScreen = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { fetchPosts, posts = [] } = usePost();
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { upvotePost, downvotePost, reportPost } = usePost();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    timeFrame: null,
    sortBy: null,
    showResolved: false,
  });
  const [notifications, setNotifications] = useState([]);
  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [previousPostStatuses, setPreviousPostStatuses] = useState({});
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    console.log("HomeScreen mounted, auth state:", { user, isAuthenticated });
    if (!loading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigation.replace("Login");
    }
  }, [isAuthenticated, loading, navigation]);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Track status changes and create notifications
  useEffect(() => {
    posts.forEach((post) => {
      const previousStatus = previousPostStatuses[post._id];
      const currentStatus = post.status?.toLowerCase();

      // Create notification for new posts (when they don't have a previous status)
      if (!previousStatus && post.userId === user?._id) {
        const newNotification = {
          id: Date.now(),
          type: "status_pending",
          postId: post._id,
          title: post.title,
          message: `Your new report "${post.title}" has been submitted and is pending review.`,
          timestamp: new Date(),
          read: false,
          status: "pending",
        };

        setNotifications((prev) => [newNotification, ...prev]);
      }
      // Create notification for status changes
      else if (previousStatus && previousStatus !== currentStatus) {
        const newNotification = {
          id: Date.now(),
          type: `status_${currentStatus}`,
          postId: post._id,
          title: post.title,
          message: getStatusMessage(currentStatus, post.title),
          timestamp: new Date(),
          read: false,
          status: currentStatus,
        };

        setNotifications((prev) => {
          // Remove any existing notifications for this post
          const filteredNotifications = prev.filter(
            (n) => n.postId !== post._id
          );
          // Add the new notification at the beginning
          return [newNotification, ...filteredNotifications];
        });
      }

      // Update previous status
      setPreviousPostStatuses((prev) => ({
        ...prev,
        [post._id]: currentStatus,
      }));
    });
  }, [posts, user?._id]);

  const getStatusMessage = (status, title) => {
    switch (status) {
      case "pending":
        return `Your report "${title}" is now pending review by the authorities.`;
      case "in-progress":
        return `Great news! Your report "${title}" is now being processed by the Municipal Authority. Expected completion: 4-5 days.`;
      case "resolved":
        return `Success! Your report "${title}" has been resolved. Check the resolution details.`;
      default:
        return `Your report "${title}" status has been updated to ${status}.`;
    }
  };

  const getUnreadCount = () => {
    return notifications.filter((n) => !n.read).length;
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${months[d.getMonth()]} ${d.getDate()}, ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const renderNotificationItem = (notification) => (
    <TouchableOpacity
      key={notification.id}
      onPress={() => {
        const post = posts.find((p) => p._id === notification.postId);
        if (post) {
          navigation.navigate("PostDetails", { post });
          setNotificationModalVisible(false);
        }
      }}
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadNotification,
      ]}
    >
      <View
        style={[
          styles.notificationIcon,
          { backgroundColor: getNotificationIconBackground(notification.type) },
        ]}
      >
        <Ionicons
          name={
            notification.type === "status_pending"
              ? "time"
              : notification.type === "status_in-progress"
                ? "hammer"
                : "checkmark-circle"
          }
          size={24}
          color={getNotificationIconColor(notification.type)}
        />
      </View>
      <View style={styles.notificationContent}>
        <Text
          style={[
            styles.notificationTitle,
            { color: getNotificationIconColor(notification.type) },
          ]}
        >
          {notification.type === "status_pending"
            ? "Report Under Review"
            : notification.type === "status_in-progress"
              ? "Processing Started"
              : "Report Resolved"}
        </Text>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>
          {formatDate(notification.timestamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getNotificationIconBackground = (type) => {
    switch (type) {
      case "status_pending":
        return "#FFF7E6"; // Light yellow
      case "status_in-progress":
        return "#EEF2FF"; // Light blue
      case "status_resolved":
        return "#ECFDF5"; // Light green
      default:
        return "#F1F5F9";
    }
  };

  const getNotificationIconColor = (type) => {
    switch (type) {
      case "status_pending":
        return "#FFB800"; // Yellow
      case "status_in-progress":
        return "#235DFF"; // Blue
      case "status_resolved":
        return "#22C55E"; // Green
      default:
        return "#64748B"; // Gray
    }
  };

  // Function to handle refreshing
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(); // Fetch posts again
    setRefreshing(false);
  };

  // Filter posts based on search and category
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = searchQuery
      ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.tags &&
          post.tags.some((tag) =>
            tag
              .toLowerCase()
              .includes(searchQuery.toLowerCase().replace("#", ""))
          ))
      : true;
    const matchesCategory =
      selectedFilter === "All" || post.category === selectedFilter || false;
    return matchesSearch && matchesCategory;
  });

  // Update the getFilteredPosts function
  const getFilteredPosts = () => {
    return posts
      .filter((post) => {
        // Search text filter
        const matchesSearch = searchQuery
          ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (post.tags &&
              post.tags.some((tag) =>
                tag
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase().replace("#", ""))
              ))
          : true;

        // Category filter
        const matchesCategory =
          selectedCategory === "All" || post.category === selectedCategory;

        // Status filter
        const matchesStatus = filters.status
          ? post.status?.toLowerCase() === filters.status
          : true;

        // Time frame filter
        const matchesTimeFrame = filters.timeFrame
          ? isWithinTimeFrame(post.createdAt, filters.timeFrame)
          : true;

        // Resolved with proof filter
        const matchesResolved = filters.showResolved
          ? post.status?.toLowerCase() === "resolved" && post.proofImage
          : true;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus &&
          matchesTimeFrame &&
          matchesResolved
        );
      })
      .sort((a, b) => {
        // Sort by selected criteria
        if (filters.sortBy === "upvotes") {
          return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
        } else if (filters.sortBy === "spam") {
          // Sort by number of reports in descending order (most reported first)
          const reportsA = a.reports?.length || 0;
          const reportsB = b.reports?.length || 0;

          // If reports are equal, sort by most recent first
          if (reportsB === reportsA) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }

          return reportsB - reportsA;
        }
        // Default sort by newest first
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  };

  // Add helper function for time frame filtering
  const isWithinTimeFrame = (dateString, timeFrame) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    switch (timeFrame) {
      case "week":
        return diffDays <= 7;
      case "30days":
        return diffDays <= 30;
      case "90days":
        return diffDays <= 90;
      default:
        return true;
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedFilter(category);
    setDropdownVisible(false);
    setExpandedCategory(null);
  };

  const toggleExpandedCategory = (mainCategory) => {
    setExpandedCategory(
      expandedCategory === mainCategory ? null : mainCategory
    );
  };

  const handleUpvote = async (postId) => {
    const result = await upvotePost(postId);
    if (!result.success) {
      Alert.alert("Error", result.message || "Failed to upvote");
    }
  };

  const handleDownvote = async (postId) => {
    const result = await downvotePost(postId);
    if (!result.success) {
      Alert.alert("Error", result.message || "Failed to downvote");
    }
  };

  const handleShare = async (post) => {
    try {
      await Share.share({
        message: `Check out this issue: ${post.title}\n${post.description}\nLocation: ${post.location.address}`,
        title: post.title,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share post");
    }
  };

  const handleReport = (post) => {
    setSelectedPost(post);
    setReportModalVisible(true);
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert("Error", "Please provide a reason for reporting");
      return;
    }
    const result = await reportPost(selectedPost._id, reportReason.trim());
    if (result.success) {
      Alert.alert("Success", "Post reported successfully");
    } else {
      Alert.alert("Error", result.message || "Failed to report post");
    }
    setReportModalVisible(false);
    setReportReason("");
  };

  const handleFilter = () => {
    // Handle filter action
    console.log("Filter pressed");
  };

  // Update the handleSearch function
  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#FFB800"; // Yellow
      case "in-progress":
        return "#235DFF"; // Blue
      case "resolved":
        return "#22C55E"; // Green
      default:
        return "#94A3B8"; // Gray
    }
  };

  const renderPost = (post) => (
    <TouchableOpacity
      key={post._id}
      onPress={() => navigation.navigate("PostDetails", { post })}
      activeOpacity={0.9} // Add slight feedback when pressed
    >
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: post.image }} style={styles.image} />
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{post.category}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.title}>{post.title}</Text>
          <View style={styles.locationContainer}>
            <Text>📍</Text>
            <Text style={styles.location}>
              {post.location.address || "No address provided"}
            </Text>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {post.description}
          </Text>
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.interactionBar}>
            <View style={styles.voteContainer}>
              <TouchableOpacity
                onPress={() => handleUpvote(post._id)}
                style={styles.voteButton}
              >
                <Ionicons
                  name={
                    post.upvotes?.includes(user?._id)
                      ? "chevron-up"
                      : "chevron-up-outline"
                  }
                  size={24}
                  color={
                    post.upvotes?.includes(user?._id) ? "#235DFF" : "#64748B"
                  }
                />
                <Text
                  style={[
                    styles.voteCount,
                    post.upvotes?.includes(user?._id) && styles.activeVoteCount,
                  ]}
                >
                  {post.upvotes?.length || 0}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDownvote(post._id)}
                style={styles.voteButton}
              >
                <Ionicons
                  name={
                    post.downvotes?.includes(user?._id)
                      ? "chevron-down"
                      : "chevron-down-outline"
                  }
                  size={24}
                  color={
                    post.downvotes?.includes(user?._id) ? "#FF4444" : "#64748B"
                  }
                />
                <Text
                  style={[
                    styles.voteCount,
                    post.downvotes?.includes(user?._id) &&
                      styles.activeDownvoteCount,
                  ]}
                >
                  {post.downvotes?.length || 0}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleShare(post)}
                style={styles.actionButton}
              >
                <Ionicons
                  name="share-social-outline"
                  size={22}
                  color="#64748B"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleReport(post)}
                style={styles.actionButton}
              >
                <Ionicons name="flag-outline" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
          {post.status && (
            <View
              style={[
                styles.statusTag,
                { backgroundColor: getStatusColor(post.status) },
              ]}
            >
              <Text style={styles.statusText}>{post.status}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType] === value ? null : value, // Toggle if same value
    }));
  };

  // Add clearFilters function
  const clearFilters = () => {
    setFilters({
      status: null,
      timeFrame: null,
      sortBy: null,
      showResolved: false,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fixit camp</Text>
        <TouchableOpacity
          onPress={() => {
            setNotificationModalVisible(true);
            markAllAsRead();
          }}
          style={styles.notificationButton}
        >
          <Ionicons name="notifications-outline" size={24} color="#1E293B" />
          {getUnreadCount() > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {getUnreadCount()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.searchAndFilterSection}>
        <SearchBar
          onSearch={handleSearch}
          value={searchQuery}
          onFilterPress={() => setFilterModalVisible(true)}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView
        style={styles.postsScrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsContainer}
      >
        {getFilteredPosts().map(renderPost)}
      </ScrollView>

      <Modal
        visible={dropdownVisible}
        transparent={true}
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            {CATEGORIES.map((category) => (
              <View key={`category-${category}`}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() =>
                    category === "All"
                      ? handleCategorySelect(category)
                      : handleCategorySelect(category)
                  }
                >
                  <Text style={styles.dropdownText}>{category}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Custom Modal for Reporting a Post */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Report Post</Text>
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

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View style={styles.filterModalContent}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              <View style={styles.filterHeaderButtons}>
                <TouchableOpacity
                  onPress={clearFilters}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#1E293B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterButtons}>
                {[
                  { label: "Pending", value: "pending", color: "#FFB800" },
                  {
                    label: "In Progress",
                    value: "in-progress",
                    color: "#235DFF",
                  },
                  { label: "Resolved", value: "resolved", color: "#22C55E" },
                ].map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.filterButton,
                      filters.status === status.value && {
                        backgroundColor: status.color,
                        borderColor: status.color,
                      },
                    ]}
                    onPress={() => handleFilterChange("status", status.value)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filters.status === status.value &&
                          styles.filterButtonTextActive,
                      ]}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Frame Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Time Frame</Text>
              <View style={styles.filterButtons}>
                {[
                  { label: "This Week", value: "week" },
                  { label: "Last 30 Days", value: "30days" },
                  { label: "Last 90 Days", value: "90days" },
                ].map((time) => (
                  <TouchableOpacity
                    key={time.value}
                    style={[
                      styles.filterButton,
                      filters.timeFrame === time.value &&
                        styles.filterButtonActive,
                    ]}
                    onPress={() => handleFilterChange("timeFrame", time.value)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filters.timeFrame === time.value &&
                          styles.filterButtonTextActive,
                      ]}
                    >
                      {time.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.filterButtons}>
                {[
                  { label: "Most Upvoted", value: "upvotes" },
                  { label: "Most Reported", value: "spam" },
                ].map((sort) => (
                  <TouchableOpacity
                    key={sort.value}
                    style={[
                      styles.filterButton,
                      filters.sortBy === sort.value &&
                        styles.filterButtonActive,
                    ]}
                    onPress={() => handleFilterChange("sortBy", sort.value)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filters.sortBy === sort.value &&
                          styles.filterButtonTextActive,
                      ]}
                    >
                      {sort.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Resolved with Proof Toggle */}
            <View style={styles.filterSection}>
              <View style={styles.toggleContainer}>
                <Text style={styles.filterSectionTitle}>
                  Show Resolved with Proof
                </Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    filters.showResolved && styles.toggleButtonActive,
                  ]}
                  onPress={() =>
                    handleFilterChange("showResolved", !filters.showResolved)
                  }
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      filters.showResolved && styles.toggleKnobActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                // Trigger re-render with current filters
                fetchPosts(); // Optionally refetch posts
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notification Modal */}
      <Modal
        visible={notificationModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <View style={styles.notificationModalOverlay}>
          <View style={styles.notificationModalContent}>
            <View style={styles.notificationModalHeader}>
              <Text style={styles.notificationModalTitle}>Notifications</Text>
              <TouchableOpacity
                onPress={() => setNotificationModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationsList}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    onPress={() => {
                      const post = posts.find(
                        (p) => p._id === notification.postId
                      );
                      if (post) {
                        navigation.navigate("PostDetails", { post });
                        setNotificationModalVisible(false);
                      }
                    }}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadNotification,
                    ]}
                  >
                    <View
                      style={[
                        styles.notificationIcon,
                        {
                          backgroundColor: getNotificationIconBackground(
                            notification.type
                          ),
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          notification.type === "status_pending"
                            ? "time"
                            : notification.type === "status_in-progress"
                              ? "hammer"
                              : "checkmark-circle"
                        }
                        size={24}
                        color={getNotificationIconColor(notification.type)}
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text
                        style={[
                          styles.notificationTitle,
                          {
                            color: getNotificationIconColor(notification.type),
                          },
                        ]}
                      >
                        Status Update
                      </Text>
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatDate(notification.timestamp)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noNotifications}>No notifications yet</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E9F2",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#235DFF",
  },
  searchAndFilterSection: {
    backgroundColor: "#E5E9F2",
    paddingBottom: 8,
    zIndex: 1,
  },
  categoryScroll: {
    marginTop: 16,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  postsScrollView: {
    flex: 1,
  },
  postsContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  categoryTag: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#79797B",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  categoryText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#235DFF",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    color: "#64748B",
    fontSize: 14,
    marginLeft: 4,
  },
  description: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  interactionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  voteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  statusTag: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    width: "80%",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  categoryButton: {
    height: 36,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCategory: {
    backgroundColor: "#235DFF",
  },
  categoryButtonText: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
  },
  selectedCategoryText: {
    color: "white",
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  filterModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterButtonActive: {
    backgroundColor: "#235DFF",
    borderColor: "#235DFF",
  },
  filterButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "white",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleButton: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: "#E2E8F0",
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: "#235DFF",
  },
  toggleKnob: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  applyButton: {
    backgroundColor: "#235DFF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  filterHeaderButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  clearButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tagText: {
    color: "#235DFF",
    fontSize: 12,
    fontWeight: "500",
  },
  notificationButton: {
    position: "relative",
    padding: 4,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  notificationModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  notificationModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  notificationModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "white",
  },
  unreadNotification: {
    backgroundColor: "#F1F5F9",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#1E293B",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#64748B",
  },
  noNotifications: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 20,
  },
});

export default HomeScreen;
