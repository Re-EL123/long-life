// app/parent-help.tsx - Parent Help & Support Center
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Types
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ContactOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
  color: string;
}

const ParentHelpScreen = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // FAQ Categories
  const categories = [
    { label: "All", value: "all" },
    { label: "Booking", value: "booking" },
    { label: "Safety", value: "safety" },
    { label: "Payment", value: "payment" },
    { label: "Drivers", value: "drivers" },
    { label: "Account", value: "account" },
  ];

  // FAQ Data
  const faqs: FAQItem[] = [
    {
      id: "1",
      category: "booking",
      question: "How do I book a trip for my child?",
      answer: "To book a trip:\n1. Tap 'Request Driver' on the home screen\n2. Select trip type (once-off, weekly, or monthly)\n3. Choose date and pickup time\n4. Enter pickup and drop-off locations\n5. Add any special instructions\n6. Tap 'Find Driver' or 'Submit Request'\n\nFor once-off trips, you'll be matched with nearby drivers immediately. For recurring trips, our admin will assign a dedicated driver within 24 hours.",
    },
    {
      id: "2",
      category: "safety",
      question: "How do I know my child is safe?",
      answer: "We prioritize your child's safety:\n\n• All drivers undergo thorough background checks and verification\n• Live GPS tracking during every trip\n• Real-time notifications when driver arrives and departs\n• In-app emergency button for instant assistance\n• Drivers are rated by parents after each trip\n• All vehicles are regularly inspected and insured\n• Photo verification of driver and vehicle before trip starts",
    },
    {
      id: "3",
      category: "booking",
      question: "Can I schedule recurring trips?",
      answer: "Yes! We offer weekly and monthly recurring trips:\n\n• Weekly: Select specific days (Mon-Sun) for regular pickups\n• Monthly: Set a schedule for the entire month\n\nFor recurring trips, you'll be assigned a dedicated, verified driver who becomes familiar with your child's routine. This provides consistency and builds trust.",
    },
    {
      id: "4",
      category: "drivers",
      question: "How are drivers vetted?",
      answer: "Every driver goes through our rigorous 7-step verification process:\n\n1. Criminal background check\n2. Driving history verification\n3. Vehicle safety inspection\n4. First aid certification\n5. Child safety training\n6. ID and license verification\n7. In-person interview\n\nOnly drivers who pass all checks are approved to transport children on our platform.",
    },
    {
      id: "5",
      category: "payment",
      question: "What payment methods do you accept?",
      answer: "We accept multiple secure payment methods:\n\n• Credit/Debit Cards (Visa, Mastercard)\n• Mobile Money (MTN, Vodacom)\n• Bank Transfer\n• In-app Wallet\n\nAll payments are processed securely through encrypted channels. You'll receive a detailed receipt after each trip.",
    },
    {
      id: "6",
      category: "booking",
      question: "Can I cancel or modify a trip?",
      answer: "Yes, you can cancel or modify trips:\n\n• Once-off trips: Cancel up to 30 minutes before pickup with no charge\n• Weekly/Monthly trips: Modify schedule with 24 hours notice\n\nTo cancel:\n1. Go to 'My Trips'\n2. Select the trip\n3. Tap 'Cancel Trip'\n4. Confirm cancellation\n\nCancellation fees may apply for late cancellations to compensate drivers.",
    },
    {
      id: "7",
      category: "safety",
      question: "What if there's an emergency during the trip?",
      answer: "In case of emergency:\n\n1. Use the in-app 'Emergency' button (red SOS icon)\n2. This immediately alerts our 24/7 support team\n3. Emergency services can be dispatched if needed\n4. You'll receive real-time updates\n\nYou can also:\n• Call the driver directly through the app\n• Contact our emergency hotline: +27 123 456 789\n• Track your child's location in real-time",
    },
    {
      id: "8",
      category: "drivers",
      question: "Can I request a specific driver?",
      answer: "For recurring trips, yes! Once you've been assigned a dedicated driver for weekly or monthly bookings, that driver will handle all scheduled trips unless they're unavailable.\n\nFor once-off trips, you're matched with the nearest available verified driver. However, you can 'favorite' drivers after trips, and the system will prioritize matching you with them when available.",
    },
    {
      id: "9",
      category: "account",
      question: "How do I add multiple children to my account?",
      answer: "To add children to your account:\n\n1. Go to Settings\n2. Tap 'Manage Children'\n3. Tap '+ Add Child'\n4. Enter child's details (name, school, grade)\n5. Add emergency contacts\n6. Save profile\n\nYou can add up to 5 children per parent account and book trips for any of them.",
    },
    {
      id: "10",
      category: "payment",
      question: "Are there any subscription plans?",
      answer: "Yes! We offer subscription plans for frequent users:\n\n• Basic Plan: R299/month - 10 trips\n• Family Plan: R499/month - 20 trips\n• Premium Plan: R799/month - Unlimited trips + priority booking\n\nAll plans include:\n- No booking fees\n- Priority driver matching\n- 24/7 support\n- Trip history and receipts\n\nPay-as-you-go is also available with no monthly commitment.",
    },
    {
      id: "11",
      category: "safety",
      question: "What COVID-19 safety measures are in place?",
      answer: "Your child's health is our priority:\n\n• All drivers wear masks during trips\n• Vehicles are sanitized between rides\n• Hand sanitizer available in all vehicles\n• Windows kept slightly open for ventilation\n• Drivers undergo temperature checks\n• Social distancing maintained when possible\n\nDrivers who show symptoms are not allowed to drive until cleared by medical professionals.",
    },
    {
      id: "12",
      category: "booking",
      question: "What areas do you service?",
      answer: "We currently operate in:\n\n• Johannesburg (Midrand, Sandton, Randburg)\n• Pretoria (Centurion, Hatfield, Brooklyn)\n• Cape Town (City Bowl, Northern Suburbs)\n• Durban (Umhlanga, Westville)\n\nWe're expanding to new areas monthly. Check the app for coverage in your area or request service expansion through the 'Request New Area' feature.",
    },
  ];

  // Contact Options
  const contactOptions: ContactOption[] = [
    {
      id: "1",
      title: "Call Support",
      subtitle: "24/7 Helpline",
      icon: "call",
      color: "#4CAF50",
      action: () => {
        Linking.openURL("tel:+27123456789");
      },
    },
    {
      id: "2",
      title: "WhatsApp",
      subtitle: "Chat with us",
      icon: "logo-whatsapp",
      color: "#25D366",
      action: () => {
        Linking.openURL("https://wa.me/27123456789");
      },
    },
    {
      id: "3",
      title: "Email Support",
      subtitle: "support@saferide.co.za",
      icon: "mail",
      color: "#2196F3",
      action: () => {
        Linking.openURL("mailto:support@saferide.co.za");
      },
    },
    {
      id: "4",
      title: "Emergency",
      subtitle: "Urgent assistance",
      icon: "warning",
      color: "#F44336",
      action: () => {
        if (Platform.OS === "web") {
          alert("Emergency: +27 123 456 789");
        } else {
          Alert.alert(
            "Emergency Hotline",
            "Call emergency support now?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Call", onPress: () => Linking.openURL("tel:+27123456789") },
            ]
          );
        }
      },
    },
  ];

  // Filter FAQs
  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Toggle FAQ
  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  // Render FAQ Item
  const renderFAQItem = (faq: FAQItem) => {
    const isExpanded = expandedFAQ === faq.id;

    return (
      <TouchableOpacity
        key={faq.id}
        style={styles.faqItem}
        onPress={() => toggleFAQ(faq.id)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <View style={styles.faqIconContainer}>
            <Ionicons
              name={isExpanded ? "remove-circle" : "add-circle"}
              size={24}
              color="#7E2EFF"
            />
          </View>
          <Text style={styles.faqQuestion}>{faq.question}</Text>
        </View>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{faq.answer}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Ionicons name="help-circle" size={64} color="#7E2EFF" />
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Find answers to common questions or contact our support team
          </Text>
        </View>

        {/* Quick Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Contact</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.contactCard, { borderLeftColor: option.color }]}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <View style={[styles.contactIconContainer, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon as any} size={24} color="#fff" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>{option.title}</Text>
                  <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.value && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category.value)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category.value && styles.categoryButtonTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FAQ List */}
          <View style={styles.faqList}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(renderFAQItem)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No results found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your search or category filter
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          <TouchableOpacity style={styles.resourceCard} activeOpacity={0.7}>
            <Ionicons name="book-outline" size={24} color="#7E2EFF" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>User Guide</Text>
              <Text style={styles.resourceSubtitle}>Complete guide to using SAFE Ride</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceCard} activeOpacity={0.7}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#7E2EFF" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Safety Guidelines</Text>
              <Text style={styles.resourceSubtitle}>Our commitment to child safety</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceCard} activeOpacity={0.7}>
            <Ionicons name="document-text-outline" size={24} color="#7E2EFF" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Terms & Conditions</Text>
              <Text style={styles.resourceSubtitle}>Legal information and policies</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Still Need Help */}
        <View style={styles.needHelpCard}>
          <Ionicons name="chatbubble-ellipses" size={40} color="#7E2EFF" />
          <Text style={styles.needHelpTitle}>Still need help?</Text>
          <Text style={styles.needHelpText}>
            Our support team is available 24/7 to assist you
          </Text>
          <TouchableOpacity
            style={styles.needHelpButton}
            onPress={() => Linking.openURL("mailto:support@saferide.co.za")}
          >
            <Text style={styles.needHelpButtonText}>Contact Support</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ParentHelpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#7E2EFF",
    paddingTop: Platform.OS === "web" ? 20 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  contactGrid: {
    gap: 12,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        cursor: "pointer",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#1A1A1A",
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  categoryButtonActive: {
    backgroundColor: "#7E2EFF",
    borderColor: "#7E2EFF",
  },
  categoryButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        cursor: "pointer",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  faqIconContainer: {
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    lineHeight: 22,
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  faqAnswerText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  resourceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        cursor: "pointer",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  resourceSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  needHelpCard: {
    backgroundColor: "#F0E6FF",
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  needHelpTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 8,
  },
  needHelpText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  needHelpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7E2EFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  needHelpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
});
