import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import ChatbotIcon from '../components/ChatbotIcon';
import Footer from '../components/Footer';

const ContactUs = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await axios.post('https://formspree.io/f/xpwazyzp', {
        username,
        email,
        message,
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Your message has been sent.');
        setUsername('');
        setEmail('');
        setMessage('');
      } else {
        Alert.alert('Error', 'There was a problem sending your message.');
      }
    } catch (error) {
      Alert.alert('Error', 'There was a problem sending your message.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <LinearGradient colors={['#a6f0f4', '#ffc0cb']} style={styles.formContainer}>
          <View style={styles.contactForm}>
            <Text style={styles.heading}>Feel Free to Contact us</Text>
            <View style={styles.contactInputs}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                autoComplete="off"
                value={username}
                onChangeText={setUsername}
                required
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoComplete="off"
                value={email}
                onChangeText={setEmail}
                required
              />
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Message"
                multiline
                numberOfLines={6}
                autoComplete="off"
                value={message}
                onChangeText={setMessage}
                required
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        <Footer/>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '90%',
    maxWidth: 600,
    borderRadius: 10,
    padding: 20,
    marginTop: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contactForm: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    marginBottom: 20,
    fontSize: 24,
    fontFamily: 'sans-serif',
  },
  contactInputs: {
    width: '100%',
  },
  input: {
    padding: 10,
    fontSize: 16,
    borderColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 15,
  },
  textarea: {
    height: 120,
  },
  submitButton: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#007bff',
    fontSize: 18,
  },
});
