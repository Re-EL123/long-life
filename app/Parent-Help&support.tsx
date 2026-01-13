import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
  {
    question: 'How do I add a child to my account?',
    answer: 'Go to your profile > Add Child. Fill in the details and save.',
    icon: <Ionicons name="person-add" size={20} color="#5A0FC8" />,
  },
  {
    question: 'How do I track the school bus?',
    answer: 'Navigate to the tracking tab to see the bus location in real-time.',
    icon: <MaterialCommunityIcons name="bus-clock" size={20} color="#5A0FC8" />,
  },
  {
    question: 'Can I message the driver?',
    answer: 'Yes, open the trip details and tap on "Message Driver".',
    icon: <Ionicons name="chatbox-ellipses-outline" size={20} color="#5A0FC8" />,
  },
  {
    question: 'How do I update my contact information?',
    answer: 'Go to settings > Profile > Edit to change your contact details.',
    icon: <Ionicons name="settings-outline" size={20} color="#5A0FC8" />,
  },
];

export default function ParentHelp() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Help & Support</Text>
        <Image
          source={require('../assets/images/logo3.png')}
          style={styles.logo}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Frequently Asked Questions</Text>

        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <TouchableOpacity onPress={() => toggleExpand(index)} style={styles.faqHeader}>
              <View style={styles.faqLeft}>
                {faq.icon}
                <Text style={styles.question}>{faq.question}</Text>
              </View>
              <Ionicons
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#5A0FC8"
              />
            </TouchableOpacity>
            {expandedIndex === index && (
              <Text style={styles.answer}>{faq.answer}</Text>
            )}
          </View>
        ))}

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Need More Help?</Text>
          <Text style={styles.contactText}>
            Reach out to us through any of the channels below:
          </Text>

          {/* Email */}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:support@safeschoolride.com')}
          >
            <Ionicons name="mail-outline" size={20} color="#5A0FC8" />
            <Text style={styles.contactDetail}>support@safeschoolride.com</Text>
          </TouchableOpacity>

          {/* Call */}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('tel:+123456789')}
          >
            <Ionicons name="call-outline" size={20} color="#5A0FC8" />
            <Text style={styles.contactDetail}>+1 234 567 89</Text>
          </TouchableOpacity>

          {/* Hours */}
          <View style={styles.contactRow}>
            <Ionicons name="time-outline" size={20} color="#5A0FC8" />
            <Text style={styles.contactDetail}>Mon - Fri: 8:00 AM - 5:00 PM</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  topBar: {
    height: 100,
    backgroundColor: '#5A0FC8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    // Removed border radius here ONLY
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logo: {
    width: 60,
    height: 40,
    resizeMode: 'contain',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#5A0FC8',
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 10, // Keep radius for cards
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  question: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  answer: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  contactSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12, // Keep radius for contact section
    marginBottom: 40,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#5A0FC8',
  },
  contactText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  contactDetail: {
    fontSize: 15,
    color: '#333',
  },
});
