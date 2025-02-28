import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { usePost } from "../context/PostContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const UpdateScreen = () => {
  const { userPosts, fetchUserPosts } = usePost();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    timeFrame: null,
    sortBy: null,
  });
  const navigation = useNavigation();

  useEffect(() => {
    loadUserPosts();
  }, []);

  const loadUserPosts = async () => {
    await fetchUserPosts();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserPosts();
    setRefreshing(false);
  };

  const getFilteredPosts = () => {
    return userPosts.filter((post) => {
      const matchesStatus = filters.status ? post.status?.toLowerCase() === filters.status : true;
      const matchesTimeFrame = filters.timeFrame ? isWithinTimeFrame(post.createdAt, filters.timeFrame) : true;
      const matchesSearch = searchQuery
        ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      return matchesSearch && matchesStatus && matchesTimeFrame;
    }).sort((a, b) => {
      if (filters.sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
  };

  const isWithinTimeFrame = (dateString, timeFrame) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    switch (timeFrame) {
      case "week": return diffDays <= 7;
      case "month": return diffDays <= 30;
      case "3months": return diffDays <= 90;
      default: return true;
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? null : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: null,
      timeFrame: null,
      sortBy: null,
    });
  };

  const filteredPosts = getFilteredPosts();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Updates</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={24} color="#235DFF" />
        </TouchableOpacity>
      </View>

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
                <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#1E293B" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterButtons}>
                {[
                  { label: "Pending", value: "pending" },
                  { label: "In Progress", value: "in-progress" },
                  { label: "Resolved", value: "resolved" },
                ].map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.filterButton,
                      filters.status === status.value && styles.filterButtonActive,
                    ]}
                    onPress={() => handleFilterChange("status", status.value)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      filters.status === status.value && styles.filterButtonTextActive,
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading reports...</Text>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <View key={post._id} style={styles.card}>
              <Image source={{ uri: post.image }} style={styles.image} />
              <View style={styles.contentBox}>
                <Text style={styles.title}>{post.title}</Text>
                <Text style={styles.description} numberOfLines={3}>
                  {post.description}
                </Text>
                <Text style={styles.category}>Category: {post.category}</Text>
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => navigation.navigate("StatusUpdate", { post })}
                >
                  <Text style={styles.reviewButtonText}>Review</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noResultsText}>No matching updates found</Text>
        )}
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
    paddingTop: 48,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    color: "#235DFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 90,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#1E293B",
  },
  filterButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    marginLeft: 8,
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#235DFF',
    borderColor: '#235DFF',
  },
  filterButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  applyButton: {
    backgroundColor: '#235DFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#333",
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#64748B",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    padding: 16,
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
  },
  contentBox: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#235DFF",
  },
  description: {
    fontSize: 14,
    color: "#64748B",
  },
  category: {
    fontSize: 14,
    color: "#94A3B8",
  },
  reviewButton: {
    backgroundColor: "#235DFF",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  reviewButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default UpdateScreen;

