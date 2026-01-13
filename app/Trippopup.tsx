import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const colors = {
  gradientStart: '#5A0FC8',
  gradientEnd: '#E64487',
  background: '#F3EFFF',
  white: '#fff',
  darkText: '#333',
};

export default function TripPopups() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleEndTrip = () => {
    setShowConfirmModal(false);
    setShowSuccessModal(true);

    // Auto-dismiss success modal after 5 seconds
    setTimeout(() => setShowSuccessModal(false), 5000);
  };

  return (
    <View style={styles.container}>
      {/* Trigger button for demonstration */}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setShowConfirmModal(true)}
      >
        <Text style={styles.triggerText}>End Trip</Text>
      </TouchableOpacity>

      {/* Confirm Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Are you sure you want to end the trip?
            </Text>

            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmButton}
            >
              <TouchableOpacity onPress={handleEndTrip}>
                <Text style={styles.confirmButtonText}>End Trip</Text>
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity
              style={{ marginTop: 12 }}
              onPress={() => setShowConfirmModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.successModalContainer}
          >
            <Text style={styles.successText}>Trip Ended Successfully</Text>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  triggerButton: {
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  triggerText: {
    fontWeight: 'bold',
    color: colors.gradientStart,
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    padding: 25,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  modalTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: colors.darkText,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelText: {
    color: colors.darkText,
    fontWeight: '500',
    fontSize: 15,
  },
  successModalContainer: {
    padding: 25,
    borderRadius: 15,
    width: '70%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  successText: {
    fontWeight: '600',
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
});
