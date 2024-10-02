import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, Image, View, ScrollView } from 'react-native';
import { openDatabaseAsync } from '../database';
import Footer from '../components/Footer';

const myLogo = require('../assets/Logo.png');
const roomToReadImage = require('../assets/roomtoread.jpg'); // Add your image here

const HomeScreen = () => {
    const [selectedLine, setSelectedLine] = useState(null);
    const [data, setData] = useState({
        registeredStudents: 0,
        totalBooks: 0,
        availableBooks: 0,
        booksCheckedOut: 0,
        dueBooks: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const db = await openDatabaseAsync();
            
            // Fetch the number of registered students
            const registeredStudentsQuery = await db.getFirstAsync(`
                SELECT COUNT(DISTINCT Student) as count FROM TransactionsCheckOut
            `);
            const registeredStudents = registeredStudentsQuery.count;
            
            // Fetch the total number of books
            const totalBooksQuery = await db.getFirstAsync(`
                SELECT COUNT(*) as count FROM Books
            `);
            const totalBooks = totalBooksQuery.count;

            // Fetch the number of available books
            const availableBooksQuery = await db.getFirstAsync(`
                SELECT COUNT(*) as count FROM Books WHERE Available = 1
            `);
            const availableBooks = availableBooksQuery.count;

            // Fetch the number of books that are checked out
            const booksCheckedOutQuery = await db.getFirstAsync(`
                SELECT COUNT(*) as count FROM Books WHERE Available = 0
            `);
            const booksCheckedOut = booksCheckedOutQuery.count;

            // Fetch the number of due books
            const dueBooksQuery = await db.getFirstAsync(`
                SELECT COUNT(*) as count 
                FROM Books 
                JOIN TransactionsCheckOut ON Books.Book_ID = TransactionsCheckOut.Book 
                WHERE Books.Available = 0 
                AND julianday('now') - julianday(TransactionsCheckOut.Date) > 7
            `);
            const dueBooks = dueBooksQuery.count;            

            // Update the state with the fetched data
            setData({
                registeredStudents,
                totalBooks,
                availableBooks,
                booksCheckedOut,
                dueBooks,
            });
        };

        fetchData();
    }, []);

    const handleLinePress = (line) => {
        setSelectedLine(line);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.heading}>Library Ledger</Text>
                <Image source={myLogo} style={styles.logo} />

                <TouchableOpacity
                    style={[styles.flag, { backgroundColor: '#d3f7fb' }, selectedLine === 1 && styles.selected]}
                    onPress={() => handleLinePress(1)}
                >
                    <Text style={styles.text}>Registered number of Students</Text>
                    <View style={styles.numberContainer}>
                        <Text style={styles.number}>{data.registeredStudents}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.flag, { backgroundColor: '#c8e6c9' }, selectedLine === 2 && styles.selected]}
                    onPress={() => handleLinePress(2)}
                >
                    <Text style={styles.text}>Total Books</Text>
                    <View style={styles.numberContainer}>
                        <Text style={styles.number}>{data.totalBooks}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.flag, { backgroundColor: '#e1bee7' }, selectedLine === 3 && styles.selected]}
                    onPress={() => handleLinePress(3)}
                >
                    <Text style={styles.text}>Available number of Books</Text>
                    <View style={styles.numberContainer}>
                        <Text style={styles.number}>{data.availableBooks}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.flag, { backgroundColor: '#fff9c4' }, selectedLine === 4 && styles.selected]}
                    onPress={() => handleLinePress(4)}
                >
                    <Text style={styles.text}>Books Checked Out</Text>
                    <View style={styles.numberContainer}>
                        <Text style={styles.number}>{data.booksCheckedOut}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.flag, { backgroundColor: '#f8bbd0' }, selectedLine === 5 && styles.selected]}
                    onPress={() => handleLinePress(5)}
                >
                    <Text style={styles.text}>Books Due</Text>
                    <View style={styles.numberContainer}>
                        <Text style={styles.number}>{data.dueBooks}</Text>
                    </View>
                </TouchableOpacity>

                {/* Room to Read Description */}
                <View style={styles.descriptionContainer}>
                    <Image source={roomToReadImage} style={styles.descriptionImage} />
                    <Text style={styles.descriptionText}>
                        Room to Read (RTR) India's Literacy Program supports early-grade children as they develop into
                        independent readers and lifelong learners. To achieve this, they combine the learning to read
                        with the magic of loving to read. Under their Literacy Program, they train teachers, create
                        quality books & curricular materials, and establish child-friendly libraries filled with diverse
                        quality-enriched children's books in local languages that can be enjoyed at school or home.
                    </Text>
                </View>
                <Footer/>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 70,
    },
    scrollContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    logo: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 50,
        height: 50,
        marginTop: -10,
        marginRight: 20.
    },
    flag: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#b2ebf2',
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginVertical: 10,
        borderRadius: 10,
        width: '80%',
    },
    selected: {
        backgroundColor: '#ffccbc',
    },
    text: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
    },
    numberContainer: {
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 5,
    },
    number: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    descriptionContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        width: '90%',
    },
    descriptionImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginBottom: 10,
        borderRadius: 15,
    },
    descriptionText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'justify', // Add this line
    },    
});
