import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const colors = {
  gradientStart: "#5A0FC8",
  gradientEnd: "#E64487",
  white: "#fff",
  darkText: "#333",
};

export default function ConfirmWithdrawalModal({
  visible,
  onClose,
  onConfirm,
  amount = 500.0,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount?: number;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Confirm Withdrawal</Text>
          <Text style={styles.modalText}>
            Are you sure you want to withdraw R{amount.toFixed(2)}?
          </Text>

          <View style={styles.buttonRow}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.withdrawButton}
            >
              <TouchableOpacity onPress={onConfirm}>
                <Text style={styles.withdrawButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity onPress={() => {router.push('/driver-withdraw');}}>
              <Text style={styles.cancelText} >Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: colors.white,
    padding: 25,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  modalTitle: {
    fontWeight: "600",
    fontSize: 18,
    color: colors.darkText,
    textAlign: "center",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: colors.darkText,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    width: "100%",
    alignItems: "center",
  },
  withdrawButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  withdrawButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelText: {
    color: colors.darkText,
    fontWeight: "500",
    fontSize: 15,
  },
});
