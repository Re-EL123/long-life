import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';



const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const DocBox = ({ source }: { source: any }) => (
  <View style={styles.docBox}>
    <Image source={source} style={styles.docImage} resizeMode="cover" />
  </View>
);

const VerifyDriverPage: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <LinearGradient
        colors={['#800080', '#ff69b4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity>
            <Text style={{ color: '#fff', fontSize: 20 }}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Driver</Text>
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.profileSection}>
          
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileCar}>Toyota Camry</Text>
        </View>
        <View style={styles.infoSection}>
          <InfoRow label="Driver’s License" value="123445689" />
          <InfoRow label="Vehicle Plate" value="ABC-1234" />
          <InfoRow label="Insurance" value="Active" />
        </View>
        
        <View style={styles.actionsSection}>
          <TouchableOpacity style={[styles.button, styles.rejectButton]}>
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.requestButton]}>
            <Text style={styles.requestText}>Request More info</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.approveButton}>
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  headerSafe: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileCar: {
    color: '#555',
    marginTop: 2,
  },
  infoSection: {
    marginTop: 20,
    marginHorizontal: 30,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  infoLabel: {
    fontWeight: '500',
  },
  infoValue: {
    color: '#222',
  },
  docsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  docBox: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 5,
    overflow: 'hidden',
  },
  docImage: {
    width: '100%',
    height: '100%',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    gap: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 5,
  },
  rejectButton: {
    backgroundColor: '#e53935',
  },
  rejectText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  requestButton: {
    borderWidth: 1,
    borderColor: '#222',
    backgroundColor: '#fff',
  },
  requestText: {
    color: '#222',
    fontWeight: 'bold',
  },
  approveButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 100,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  approveText: {
    color: '#222',
    fontWeight: 'bold',
  },
});

export default VerifyDriverPage;