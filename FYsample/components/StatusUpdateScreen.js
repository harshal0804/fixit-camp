import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';

const StatusUpdateScreen = ({ route }) => {
  const { post } = route.params;
  
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: null
  });

  const clearFilters = () => {
    setFilters({
      sortBy: null
    });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? null : value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          currentStep: 0,
          activeColor: "#FFB800",
          backgroundColor: "#FFF7E6"
        };
      case "in-progress":
        return {
          currentStep: 1,
          activeColor: "#235DFF",
          backgroundColor: "#EEF2FF"
        };
      case "resolved":
        return {
          currentStep: 2,
          activeColor: "#22C55E",
          backgroundColor: "#ECFDF5"
        };
      default:
        return {
          currentStep: 0,
          activeColor: "#64748B",
          backgroundColor: "#F1F5F9"
        };
    }
  };

  const getStatusMessage = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Your issue has been successfully registered! Our team will review it soon. Stay tuned for updates.";
      case "in-progress":
        return "Your issue is being investigated by the authorities. We'll keep you posted on the progress. Expected completion: 4-5 working days";
      case "resolved":
        return "Your reported issue has been resolved! Thank you for contributing to a better community. Check the updates for proof.";
      default:
        return "Your issue has been successfully registered! Our team will review it soon. Stay tuned for updates.";
    }
  };

  const statusUpdates = [
    {
      status: 'Issue registered',
      time: formatDate(post.createdAt),
      icon: 'alert-circle-outline',
    },
    {
      status: 'Admin investigating',
      time: formatDate(post.inProgressAt),
      icon: 'search-outline',
    },
    {
      status: 'Issue resolved',
      time: formatDate(post.resolvedAt),
      icon: 'checkmark-circle-outline',
    }
  ];

  const { currentStep, activeColor } = getStatusConfig(post.status);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Status updates</Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Report Details Section */}
        <View style={styles.reportDetails}>
          <Text style={styles.reportId}>Report ID: {post._id}</Text>
          <View style={styles.reportContent}>
            <Image source={{ uri: post.image }} style={styles.reportImage} />
            <View style={styles.reportTextContent}>
              <Text style={styles.reportTitle}>{post.title}</Text>
              <Text style={styles.reportDescription} numberOfLines={2}>
                {post.description}
              </Text>
              <Text style={styles.date}>
                {new Date(post.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.reportDetails}>
          <Text style={[styles.reportId, { marginBottom: 16 }]}>
            Current Status:
          </Text>
          <View style={styles.timeline}>
            {statusUpdates.map((item, index) => {
              const isActive = index <= currentStep;
              const itemColor = isActive ? activeColor : "#94A3B8";

              return (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.iconContainer}>
                    <View
                      style={[
                        styles.iconBackground,
                        {
                          backgroundColor: isActive
                            ? getStatusConfig(post.status).backgroundColor
                            : "#F1F5F9",
                        },
                      ]}
                    >
                      <Ionicons name={item.icon} size={24} color={itemColor} />
                    </View>
                    {index !== statusUpdates.length - 1 && (
                      <View
                        style={[
                          styles.verticalLine,
                          { backgroundColor: itemColor },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.statusContent}>
                    <Text style={[styles.statusText, { color: itemColor }]}>
                      {item.status}
                    </Text>
                    <Text
                      style={[
                        styles.timeText,
                        { color: item.time ? "#64748B" : "#94A3B8" },
                      ]}
                    ></Text>
                    <Text style={styles.statusMessage}>
                      {(() => {
                        const currentStatus = post.status?.toLowerCase();
                        // For first item (pending)
                        if (index === 0) {
                          return getStatusMessage("pending");
                        }
                        // For second item (in-progress)
                        if (index === 1) {
                          return currentStatus === "pending"
                            ? "Pending"
                            : getStatusMessage("in-progress");
                        }
                        // For third item (resolved)
                        if (index === 2) {
                          if (
                            currentStatus === "pending" ||
                            currentStatus === "in-progress"
                          ) {
                            return "Pending";
                          }
                          return getStatusMessage("resolved");
                        }
                      })()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Add After Image Section */}
        {post.status?.toLowerCase() === "resolved" && (
          <View style={styles.afterImageContainer}>
            <Text style={styles.afterImageTitle}>Proof:</Text>
            <Image
              source={{ uri: post.afterImage }}
              style={styles.afterImage}
            />
          </View>
        )}
      </ScrollView>

      {/* Add filter modal */}
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
            </View>

            {/* Sort By Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.filterButtons}>
                {[
                  { label: "Most Upvoted", value: "upvotes" },
                  { label: "Most Reported", value: "spam" },
                  { label: "Newest First", value: "newest" }
                ].map((sort) => (
                  <TouchableOpacity
                    key={sort.value}
                    style={[
                      styles.filterButton,
                      filters.sortBy === sort.value && styles.filterButtonActive,
                    ]}
                    onPress={() => handleFilterChange("sortBy", sort.value)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filters.sortBy === sort.value && styles.filterButtonTextActive,
                      ]}
                    >
                      {sort.label}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E9F2",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Add extra padding at bottom for better scrolling
  },
  date: {
    fontSize: 14,
    color: "#999",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#235DFF",
    marginBottom: 16,
    marginTop: 48,
    paddingHorizontal: 20,
  },
  reportDetails: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    padding: 16,
  },
  reportId: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
  },
  reportContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
  },
  reportTextContent: {
    flex: 1,
    justifyContent: "center",
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#235DFF",
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  timeline: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 32, // Increased spacing between items
  },
  iconContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  verticalLine: {
    width: 2,
    height: 60, // Increased to accommodate the message
    backgroundColor: "#E2E8F0",
    marginTop: 8,
  },
  statusContent: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statusMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    marginTop: 8,
    paddingRight: 16,
  },
  afterImageContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    padding: 16,
  },
  afterImageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22C55E",
    marginBottom: 12,
  },
  afterImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  closeButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: 'black',
    borderColor: 'black',
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
});

export default StatusUpdateScreen;