import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const StudentsPage = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    if (!searchText.trim()) {
      Alert.alert('Error', 'Please enter a valid student ID');
      return;
    }

    navigation.navigate('ViewStudent', { studentId: searchText.trim() });
    setSearchText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter the Student ID to search..."
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StudentsPage;
