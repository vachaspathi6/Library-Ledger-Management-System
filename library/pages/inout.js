import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import RadioForm from 'react-native-simple-radio-button';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseAsync('SchoolDB.db');

const TransactionPage = () => {
  const [transaction, setTransaction] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [completed, setCompleted] = useState(null);
  const [rating, setRating] = useState('');
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchBooks();
    fetchStudents();
  }, [transaction]);

  const fetchBooks = async () => {
    try {
      const dbInstance = await SQLite.openDatabaseAsync('SchoolDB.db');
      const availableCondition = transaction === 'check-out' ? 'Available = 1' : 'Available = 0';
      const results = await dbInstance.getAllAsync(`SELECT * FROM Books WHERE ${availableCondition}`);
      setBooks(results);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const dbInstance = await SQLite.openDatabaseAsync('SchoolDB.db');
      const results = await dbInstance.getAllAsync('SELECT * FROM Students');
      setStudents(results);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleTransactionChange = (value) => {
    setTransaction(value);
    setSelectedBook('');
    setSelectedStudent('');
    setCompleted(null);
    setRating('');
  };

  const handleSubmit = async () => {
    const currentDate = new Date().toISOString();
    const dbInstance = await SQLite.openDatabaseAsync('SchoolDB.db');
  
    try {
        await dbInstance.runAsync('BEGIN TRANSACTION;');
  
        if (transaction === 'check-out') {
            const tid = `OUT${Date.now()}`;
            await dbInstance.runAsync(
                'INSERT INTO TransactionsCheckOut (TID, Student, Book, Date) VALUES (?, ?, ?, ?)',
                [tid, selectedStudent, selectedBook, currentDate]
            );
  
            await dbInstance.runAsync(
                'UPDATE Books SET Available = 0, Last_TID = ? WHERE Book_Name = ? AND Book_ID = ?',
                [tid, ...selectedBook.split(', ')]
            );
        } else if (transaction === 'check-in') {
            const tid = `IN${Date.now()}`;
            const feedback = JSON.stringify({ completed, liked: rating });
  
            const checkOutDateRes = await dbInstance.getFirstAsync(
                'SELECT Date FROM TransactionsCheckOut WHERE Book = ? AND Student = ?',
                [selectedBook, selectedStudent]
            );
  
            if (checkOutDateRes && checkOutDateRes.Date) {
                const checkOutDate = new Date(checkOutDateRes.Date);
                const diffDays = Math.ceil((new Date(currentDate) - checkOutDate) / (1000 * 60 * 60 * 24));
                const fineAmount = diffDays > 0 ? diffDays : 0;
  
                await dbInstance.runAsync(
                    'INSERT INTO TransactionsCheckIn (TID, Student, Book, Date, Feedback, FineAmount) VALUES (?, ?, ?, ?, ?, ?)',
                    [tid, selectedStudent, selectedBook, currentDate, feedback, fineAmount]
                );
  
                await dbInstance.runAsync(
                    'UPDATE Books SET Available = 1, Last_TID = ? WHERE Book_Name = ? AND Book_ID = ?',
                    [tid, ...selectedBook.split(', ')]
                );
  
                const student = students.find(s => `${s.Name}, ${s.StudentID}` === selectedStudent);
                if (student) {
                    const booksRead = JSON.parse(student.Books_Read);
                    const book = books.find(b => `${b.Book_Name}, ${b.Book_ID}` === selectedBook);
                    if (book) {
                        booksRead[book.Level] = booksRead[book.Level] + 1;
  
                        // Adjust the level based on rating and book level
                        let newLevel = student.Current_Level;
                        if (rating === 1) {
                            newLevel = Math.max(1, newLevel - 1);
                        } else if (rating === 3) {
                            newLevel = Math.max(newLevel, book.Level);
                        }
  
                        await dbInstance.runAsync(
                            'UPDATE Students SET Books_Read = ?, Current_Level = ? WHERE StudentID = ?',
                            [JSON.stringify(booksRead), newLevel, student.StudentID]
                        );
                    }
                }
            } else {
                throw new Error('No matching check-out record found for this book and student.');
            }
        }
  
        await dbInstance.runAsync('COMMIT;');
  
        const successMessage = transaction === 'check-out' ? 'Successfully Checked-out' : 'Successfully Checked-in';
        Alert.alert('Success', successMessage);
  
        setTransaction('');
        setSelectedBook('');
        setSelectedStudent('');
        setCompleted(null);
        setRating('');
        fetchBooks(); // Fetch updated books after transaction
    } catch (error) {
        await dbInstance.runAsync('ROLLBACK;');
  
        console.error('Transaction error: ', error);
        Alert.alert('Transaction Error', error.message || 'An error occurred while processing the transaction.');
    }
  };  

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.header}>Book with Ease: Check-In and Out in Seconds</Text>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <Button
              title="Check-In"
              onPress={() => handleTransactionChange('check-in')}
              color={transaction === 'check-in' ? '#4CAF50' : '#8BC34A'}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              title="Check-Out"
              onPress={() => handleTransactionChange('check-out')}
              color={transaction === 'check-out' ? '#2196F3' : '#64B5F6'}
            />
          </View>
        </View>

        {(transaction === 'check-out' || transaction === 'check-in') && (
          <>
            <Text style={styles.label}>Book:</Text>
            <RNPickerSelect
              onValueChange={(value) => setSelectedBook(value)}
              items={books.map(book => ({ label: `${book.Book_Name}, ${book.Book_ID}`, value: `${book.Book_Name}, ${book.Book_ID}` }))}
              style={pickerSelectStyles}
            />

            <Text style={styles.label}>Student:</Text>
            <RNPickerSelect
              onValueChange={(value) => setSelectedStudent(value)}
              items={students.map(student => ({ label: `${student.Name}, ${student.StudentID}`, value: `${student.Name}, ${student.StudentID}` }))}
              style={pickerSelectStyles}
            />
          </>
        )}

        {transaction === 'check-in' && (
          <>
            <Text style={styles.label}>Feedback:</Text>
            <Text style={styles.label}>Completed:</Text>
            <RadioForm
              radio_props={[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ]}
              initial={-1}
              onPress={(value) => setCompleted(value)}
              formHorizontal={true}
              labelHorizontal={true}
              buttonColor={'#2196f3'}
              selectedButtonColor={'#2196f3'}
              labelStyle={styles.radioLabel}
            />

            <Text style={styles.label}>Rating (1 to 3):</Text>
            <RadioForm
              radio_props={[
                { label: '1', value: 1 },
                { label: '2', value: 2 },
                { label: '3', value: 3 },
              ]}
              initial={-1}
              onPress={(value) => setRating(value)}
              formHorizontal={true}
              labelHorizontal={true}
              buttonColor={'#2196f3'}
              selectedButtonColor={'#2196f3'}
              labelStyle={styles.radioLabel}
            />
          </>
        )}

        {(transaction === 'check-out' || transaction === 'check-in') && (
          <Button title="Submit" onPress={handleSubmit} color="#FF5722" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#666',
  },
  radioLabel: {
    fontSize: 16,
    marginRight: 20,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
  },
});

export default TransactionPage;
