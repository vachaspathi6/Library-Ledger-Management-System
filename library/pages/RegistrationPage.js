import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { openDatabaseAsync } from '../database';

const RegistrationPage = ({ navigation }) => {
  const [teacherName, setTeacherName] = useState('');
  const [schoolID, setSchoolID] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegistration = async () => {
    const db = await openDatabaseAsync();

    try {
      // Check if the teacher already exists
      const existingTeacher = await db.getFirstAsync(
        'SELECT * FROM Teachers WHERE TeacherName = ? AND SchoolID = ?',
        [teacherName, schoolID]
      );

      if (existingTeacher) {
        Alert.alert('Registration Failed', 'Teacher already exists.');
        return;
      }

      // Insert new teacher record
      const result = await db.runAsync(
        'INSERT INTO Teachers (TeacherName, SchoolID, Email, Password) VALUES (?, ?, ?, ?)',
        [teacherName, schoolID, email, password]
      );

      const newTeacherID = result.lastInsertRowId;

      // Prepare email content
      const emailSubject = 'Your Registration Credentials';
      const emailBody = `Dear ${teacherName},\n\nYour registration is successful. Here are your login credentials:\nUsername: ${newTeacherID}\nPassword: ${password}\n\nPlease keep this information safe.\n\nBest regards,\nYour School Admin`;

      // Send email using axios and Formspree
      try {
        const response = await axios.post('https://formspree.io/f/xpwazyzp', {
          username: teacherName,
          email: email,
          message: emailBody,
        });

        if (response.status === 200) {
          Alert.alert('Registration Successful', 'Your credentials have been sent to your email.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
        } else {
          Alert.alert('Registration Successful', 'Error sending email. Please contact support.');
        }
      } catch (error) {
        console.error('Error sending email: ', error);
        Alert.alert('Registration Successful', 'Error sending email. Please contact support.');
      }

    } catch (error) {
      console.log('Error executing SQL: ', error);
      Alert.alert('Registration Failed', 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Registration</Text>

      <TextInput
        style={styles.input}
        placeholder="Teacher Name"
        value={teacherName}
        onChangeText={setTeacherName}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="School ID"
        value={schoolID}
        onChangeText={setSchoolID}
        keyboardType="numeric"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.registerButton} onPress={handleRegistration}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Login here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  registerButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#333',
  },
  loginLink: {
    fontSize: 16,
    color: '#007BFF',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default RegistrationPage;
