import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';

const ForgotPasswordScreen = () => {
  const [code, setCode] = useState(['', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text.slice(-1); // only allow 1 digit
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    if (index === 3 && text) {
      Keyboard.dismiss();
    }
  };

  const handleResend = () => {
    // Add resend logic here
    alert('Resend code triggered');
  };

  const handleNext = () => {
    const enteredCode = code.join('');
    // Add code verification logic
    alert(`Entered Code: ${enteredCode}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter 4 digit code sent via Email</Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.codeInput}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            ref={ref => { inputs.current[index] = ref; }}
          />
        ))}
      </View>

      <Text style={styles.smsNote}> Didnt receive any email?</Text>

      <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
        <Text style={styles.resendText}>Resend SMS</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.nextButton} onPress={() => {router.push("/resetPassord")}}>
        <Text style={styles.nextText}>next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',

    
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 40,
    padding: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
    padding: 30,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#999',
    textAlign: 'center',
    fontSize: 20,
    marginHorizontal: 5,
  },
  smsNote: {
    marginVertical: 10,
    color: '#888',
  },
  resendButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  resendText: {
    color: '#000',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    elevation: 4,
  },
  nextText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
});