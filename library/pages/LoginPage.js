import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { openDatabaseAsync, initializeDatabase } from '../database';

const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  return { question: `${num1} + ${num2}`, answer: num1 + num2 };
};

const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState({});
  const [captchaInput, setCaptchaInput] = useState('');

  useEffect(() => {
    initializeDatabase();
    setCaptcha(generateCaptcha());
  }, []);

  const handleLogin = async () => {
    if (parseInt(captchaInput) !== captcha.answer) {
      Alert.alert('Captcha Failed', 'Incorrect CAPTCHA, please try again.');
      setCaptcha(generateCaptcha()); // Regenerate CAPTCHA
      return;
    }

    const db = await openDatabaseAsync();

    try {
      const result = await db.getFirstAsync('SELECT * FROM Teachers WHERE TeacherID = ? AND Password = ?', [username, password]);
      
      if (result) {
        Alert.alert('Login Successful', 'Welcome!', [
          { text: 'OK', onPress: () => {
            navigation.navigate('SideBar', {teacherId: result.TeacherID });
          }   },
        ]);
      } else {
        Alert.alert('Login Failed', 'Invalid username or password.');
      }
    } catch (error) {
      console.log('Error executing SQL: ', error);
      Alert.alert('Login Failed', 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        keyboardType="numeric"
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
      
      {/* CAPTCHA Section */}
      <Text style={styles.captchaQuestion}>Solve the CAPTCHA: {captcha.question}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter CAPTCHA"
        value={captchaInput}
        onChangeText={setCaptchaInput}
        keyboardType="numeric"
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Route to Registration Page */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>New Teacher?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Register Here</Text>
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
  captchaQuestion: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#555',
  },
  loginButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#333',
  },
  registerLink: {
    fontSize: 16,
    color: '#007BFF',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default LoginPage;
