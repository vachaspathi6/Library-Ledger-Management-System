import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import { openDatabaseAsync } from '../database';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import _ from 'lodash';
import Footer from '../components/Footer';

const BookSearchApp = () => {
  const [query, setQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [bookData, setBookData] = useState([]);
  const [direction, setDirection] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      const db = await openDatabaseAsync('SchoolDB.db');
      const results = await db.getAllAsync('SELECT * FROM Books');

      const transformedResults = await Promise.all(
        results.map(async (book) => {
          let days = 0;
          if (book.Available === 0) {
            const transaction = await db.getFirstAsync(
              `SELECT Date FROM TransactionsCheckOut WHERE TID = ?`,
              [book.Last_TID]
            );
            const checkOutDate = new Date(transaction.Date);
            const currentDate = new Date();
            const differenceInTime = currentDate.getTime() - checkOutDate.getTime();
            const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
            days = differenceInDays > 7 ? 'Due' : 7 - differenceInDays;
          }
          return {
            bookName: book.Book_Name,
            availability: book.Available ? 'Available' : 'Not Available',
            days: book.Available ? 0 : days,
            imageLink: book.ImageLink || 'https://via.placeholder.com/100',
            level: book.Level || 'Not specified',
            genre: book.Genres || 'Unknown',
            language: book.Language || 'Unknown',
          };
        })
      );

      setBookData(transformedResults);
    };

    fetchBooks();
  }, []);

  const handleSearch = (text) => {
    setQuery(text);
    if (text) {
      const filtered = bookData.filter((book) =>
        book.bookName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks([]);
    }
  };

  const sortTable = (column) => {
    const newDirection = direction === 'desc' ? 'asc' : 'desc';
    const sortedData = _.orderBy(bookData, [column], [newDirection]);
    setSelectedColumn(column);
    setDirection(newDirection);
    setBookData(sortedData);
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      {['bookName', 'availability', 'days'].map((column, index) => (
        <TouchableOpacity
          key={index}
          style={styles.columnHeader}
          onPress={() => sortTable(column)}
        >
          <Text style={styles.columnHeaderTxt}>
            {column.charAt(0).toUpperCase() + column.slice(1)}{' '}
            {selectedColumn === column && (
              <MaterialCommunityIcons
                name={direction === 'desc' ? 'arrow-down-drop-circle' : 'arrow-up-drop-circle'}
              />
            )}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBookRows = (books) => (
    books.map((book) => (
      <View key={book.bookName} style={styles.tableRow}>
        <Image source={{ uri: book.imageLink }} style={styles.bookImage} />
        <View style={styles.bookDetails}>
          <Text style={styles.bookTitle}>{book.bookName}</Text>
          
          {/* Availability and Days Side by Side */}
          <View style={styles.rowContainer}>
            <Text style={styles.bookAvailability}>{book.availability}</Text>
            <Text style={styles.bookDays}>{book.days === 'Due' ? 'Due' : `${book.days} days left`}</Text>
          </View>

          {/* Level and Genre Side by Side */}
          <View style={styles.rowContainer}>
            <Text style={styles.bookExtraInfo}>Level: {book.level}</Text>
            <Text style={styles.bookExtraInfo}>Genre: {book.genre}</Text>
          </View>

          {/* Language */}
          <Text style={styles.bookExtraInfo}>Language: {book.language}</Text>
        </View>
      </View>
    ))
  );

  const renderNoResults = () => (
    query && filteredBooks.length === 0 ? (
      <View style={styles.noResultsContainer}>
        <Text style={styles.noResultsText}>No books found</Text>
      </View>
    ) : null
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Autocomplete
          data={filteredBooks}
          defaultValue={query}
          onChangeText={handleSearch}
          placeholder="Search for a book"
          flatListProps={{
            keyExtractor: (item) => item.bookName,
            renderItem: ({ item }) => (
              <TouchableOpacity onPress={() => setQuery(item.bookName)}>
                <Text style={styles.tableCell}>{item.bookName}</Text>
              </TouchableOpacity>
            ),
          }}
          inputContainerStyle={styles.inputContainer}
          listContainerStyle={styles.listContainer}
        />
      </View>
      <ScrollView style={styles.scrollContainer}>
        {renderNoResults()}
        {filteredBooks.length > 0 && (
          <View style={styles.tableContainer}>
            {renderTableHeader()}
            {renderBookRows(filteredBooks)}
          </View>
        )}
        {query === '' && (
          <View style={styles.tableContainer}>
            {renderTableHeader()}
            {renderBookRows(bookData)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: 100,
  },
  searchContainer: {
    position: 'relative',
    zIndex: 1,
    paddingHorizontal: 5,
    marginBottom: 50,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    height: 60,
  },
  listContainer: {
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  tableContainer: {
    marginTop: 20,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#37C2D0',
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
    height: 50,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bookImage: {
    width: 80,
    height: 120,
    marginRight: 10,
    borderRadius: 5,
  },
  bookDetails: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  bookTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  bookAvailability: {
    fontSize: 14,
  },
  bookDays: {
    fontSize: 14,
    color: 'red',
  },
  bookExtraInfo: {
    fontSize: 12,
    color: 'gray',
  },
  columnHeader: {
    width: '33.33%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnHeaderTxt: {
    color: 'white',
    fontWeight: 'bold',
  },
  noResultsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ffe6e6',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#cc0000',
    fontSize: 16,
  },
});

export default BookSearchApp;
