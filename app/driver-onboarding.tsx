import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    SafeAreaView,
    Image,
    ActivityIndicator,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API URL
const API_URL = 'https://temp-weld-rho.vercel.app';

// Define shape of the form data
interface DriverOnboardingData {
    registrationNumber: string;
    passengerSeats: string; // Input as string, convert to number
    carBrand: string;
    carModel: string;
    cellNumber: string;
    driverPicture: string; // Placeholder or URL
}

const DriverOnboarding = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<DriverOnboardingData>({
        registrationNumber: '',
        passengerSeats: '',
        carBrand: '',
        carModel: '',
        cellNumber: '',
        driverPicture: 'https://via.placeholder.com/150', // Default placeholder
    });

    const [errors, setErrors] = useState<Partial<DriverOnboardingData>>({});

    const validate = () => {
        const newErrors: Partial<DriverOnboardingData> = {};
        if (!formData.registrationNumber) newErrors.registrationNumber = "Registration Number is required";
        if (!formData.passengerSeats) newErrors.passengerSeats = "Number of passenger seats is required";
        if (!formData.carBrand) newErrors.carBrand = "Car Brand is required";
        if (!formData.carModel) newErrors.carModel = "Car Model is required";
        if (!formData.cellNumber) newErrors.cellNumber = "Cell Number is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                if (Platform.OS === 'web') {
                    window.alert("Authentication token not found. Please log in again.");
                } else {
                    Alert.alert("Error", "Authentication token not found. Please log in again.");
                }
                router.replace("/LoginPage");
                return;
            }

            console.log(`Sending onboarding request to ${API_URL}/api/user/driver-onboarding`);

            const response = await fetch(`${API_URL}/api/user/driver-onboarding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    registrationNumber: formData.registrationNumber,
                    passengerSeats: parseInt(formData.passengerSeats, 10),
                    carBrand: formData.carBrand,
                    carModel: formData.carModel,
                    cellNumber: formData.cellNumber,
                    driverPicture: formData.driverPicture
                })
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (response.ok && data.success) {
                // Store onboarding status
                await AsyncStorage.setItem('onboardingCompleted', 'true');
                
                if (Platform.OS === 'web') {
                    window.alert("Profile updated successfully!");
                } else {
                    Alert.alert(
                        "Success", 
                        "Profile updated successfully!",
                        [
                            {
                                text: 'OK',
                                onPress: () => router.replace("/LoginPage")
                            }
                        ]
                    );
                }
                
                // Redirect to login or driver dashboard
                router.replace("/LoginPage");
            } else {
                const msg = data.message || "Failed to update profile";
                if (Platform.OS === 'web') {
                    window.alert(msg);
                } else {
                    Alert.alert("Error", msg);
                }
            }
        } catch (error) {
            console.error("Onboarding error:", error);
            if (Platform.OS === 'web') {
                window.alert("An error occurred. Please try again.");
            } else {
                Alert.alert("Error", "An error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.appBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Vehicle & Driver Info</Text>
                <Image
                    source={require("../assets/images/logo3.png")}
                    style={styles.logo2}
                    resizeMode="contain"
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formCard}>
                    <Text style={styles.infoText}>Please complete your profile to start driving.</Text>

                    {/* Registration Number */}
                    <Text style={styles.label}>Vehicle Registration Number:</Text>
                    <TextInput
                        placeholder="e.g. CA 123-456"
                        style={styles.textInput}
                        value={formData.registrationNumber}
                        onChangeText={(text) => setFormData({ ...formData, registrationNumber: text })}
                    />
                    {errors.registrationNumber && <Text style={styles.errorText}>{errors.registrationNumber}</Text>}

                    {/* Passenger Seats */}
                    <Text style={styles.label}>Passenger Seats:</Text>
                    <TextInput
                        placeholder="No. of seats available for students"
                        style={styles.textInput}
                        keyboardType="numeric"
                        value={formData.passengerSeats}
                        onChangeText={(text) => setFormData({ ...formData, passengerSeats: text })}
                    />
                    {errors.passengerSeats && <Text style={styles.errorText}>{errors.passengerSeats}</Text>}

                    {/* Car Brand */}
                    <Text style={styles.label}>Car Brand:</Text>
                    <TextInput
                        placeholder="e.g. Toyota, Volkswagen"
                        style={styles.textInput}
                        value={formData.carBrand}
                        onChangeText={(text) => setFormData({ ...formData, carBrand: text })}
                    />
                    {errors.carBrand && <Text style={styles.errorText}>{errors.carBrand}</Text>}

                    {/* Car Model */}
                    <Text style={styles.label}>Car Model:</Text>
                    <TextInput
                        placeholder="e.g. Corolla, Polo"
                        style={styles.textInput}
                        value={formData.carModel}
                        onChangeText={(text) => setFormData({ ...formData, carModel: text })}
                    />
                    {errors.carModel && <Text style={styles.errorText}>{errors.carModel}</Text>}

                    {/* Cell Number */}
                    <Text style={styles.label}>Cell Number:</Text>
                    <TextInput
                        placeholder="Driver's contact number"
                        style={styles.textInput}
                        keyboardType="phone-pad"
                        value={formData.cellNumber}
                        onChangeText={(text) => setFormData({ ...formData, cellNumber: text })}
                    />
                    {errors.cellNumber && <Text style={styles.errorText}>{errors.cellNumber}</Text>}

                    {/* Button */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Complete Registration</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DriverOnboarding;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9F9",
    },
    appBar: {
        height: 100,
        backgroundColor: "#5A0FC8",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingTop: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    backBtn: {
        padding: 6,
    },
    title: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    logo2: {
        width: 55,
        height: 40,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    formCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    infoText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center'
    },
    label: {
        fontSize: 15,
        color: "#333",
        marginBottom: 6,
        fontWeight: "600",
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: 14,
        marginBottom: 10,
        backgroundColor: "#FAFAFA",
    },
    button: {
        backgroundColor: "#5A0FC8",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonDisabled: {
        backgroundColor: "#A0A0A0",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginBottom: 8,
    },
});
