import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { openDatabaseAsync } from '../database'; // Adjust the path as per your project structure
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import _ from "lodash";

const ViewStudent = ({ route }) => {
  const { studentId } = route.params;
  const [levelData, setLevelData] = useState([0, 0, 0, 0, 0, 0]);
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));
  const [transactions, setTransactions] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [direction, setDirection] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [studentName, setStudentName] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    fetchStudentData(studentId);
    fetchTransactionData(studentId);
    fetchRecommendedBooks(studentId);
  }, [studentId]);

  const getBooksReadByStudentId = async (studentId) => {
    try {
      const db = await openDatabaseAsync();
      const results = await db.getAllAsync(
        `
        SELECT Books_Read
        FROM Students
        WHERE StudentID = ?
        `,
        [studentId]
      );
      return results.length > 0 ? JSON.parse(results[0].Books_Read) : {};
    } catch (error) {
      console.error('Error fetching Books_Read:', error);
      throw error;
    }
  };

  const fetchStudentData = async (studentId) => {
    try {
      const dbInstance = await openDatabaseAsync();

      // Fetch Books_Read array from Students table
      const booksRead = await getBooksReadByStudentId(studentId);

      const nameResult = await dbInstance.getFirstAsync(`
        SELECT Name
        FROM Students
        WHERE StudentID = ?
      `, [studentId]);
  
      if (nameResult) {
        setStudentName(nameResult.Name);
      }
      // Level-wise analysis
      const levels = [0, 0, 0, 0, 0, 0];
      Object.keys(booksRead).forEach((key) => {
        const level = parseInt(key);
        if (level >= 1 && level <= 6) {
          levels[level - 1] = booksRead[key];
        }
      });
      setLevelData(levels);

      // Monthly analysis (example query, adjust as needed)
      const monthResults = await dbInstance.getAllAsync(`
        SELECT strftime('%m', Date) as month, COUNT(*) as count
        FROM TransactionsCheckOut
        JOIN Books ON SUBSTR(TransactionsCheckOut.Book, INSTR(TransactionsCheckOut.Book, ', ') + 2) = Books.Book_ID
        WHERE SUBSTR(TransactionsCheckOut.Student, INSTR(TransactionsCheckOut.Student, ', ') + 2) = ?
        GROUP BY month`, [studentId]);

      const months = Array(12).fill(0);
      monthResults.forEach(row => {
        months[parseInt(row.month) - 1] = row.count;
      });
      setMonthlyData(months);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const fetchTransactionData = async (studentId) => {
    try {
      const dbInstance = await openDatabaseAsync();

      const results = await dbInstance.getAllAsync(`
        SELECT TransactionsCheckOut.TID, TransactionsCheckOut.Book, TransactionsCheckOut.Student, TransactionsCheckOut.Date,
               (CASE 
                  WHEN (julianday('now') - julianday(TransactionsCheckOut.Date)) <= 7 
                  THEN ROUND(7 - (julianday('now') - julianday(TransactionsCheckOut.Date)), 0)
                  ELSE 0
               END) AS DaysLeft,
               (CASE 
                  WHEN (julianday('now') - julianday(TransactionsCheckOut.Date)) > 7 
                  THEN ROUND((julianday('now') - julianday(TransactionsCheckOut.Date) - 7) * 1, 0) 
                  ELSE 0 
               END) AS FineAmount
        FROM TransactionsCheckOut
        JOIN Books ON SUBSTR(TransactionsCheckOut.Book, INSTR(TransactionsCheckOut.Book, ', ') + 2) = Books.Book_ID
        WHERE Books.Available = 0 AND SUBSTR(TransactionsCheckOut.Student, INSTR(TransactionsCheckOut.Student, ', ') + 2) = ?
      `, [studentId]);

      const formattedResults = results.map(row => [
        row.TID,
        row.Book,
        row.Student,
        row.Date,
        row.DaysLeft,
        row.FineAmount
      ]);

      setTransactions(formattedResults);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    }
  };

  const fetchRecommendedBooks = async (studentId) => {
    try {
      const dbInstance = await openDatabaseAsync();

      const result = await dbInstance.getFirstAsync(`
        SELECT Current_Level
        FROM Students
        WHERE StudentID = ?
      `, [studentId]);

      const level = result.Current_Level;

      const recommendedResults = await dbInstance.getAllAsync(`
        SELECT Book_Name, Genres, ImageLink
        FROM Books
        WHERE Level = ?
      `, [level]);

      // Fetch images for each book
      const booksWithImages = recommendedResults.map(book => ({
        ...book,
        imageUrl: book.ImageLink, // Replace this with the actual image URL from Google
      }));

      setRecommendedBooks(booksWithImages);
    } catch (error) {
      console.error('Error fetching recommended books:', error);
    }
  };

  const sortTable = (column) => {
    const newDirection = direction === "desc" ? "asc" : "desc";
    const sortedData = _.orderBy(transactions, [row => row[tableHead.indexOf(column)]], [newDirection]);
    setSelectedColumn(column);
    setDirection(newDirection);
    setTransactions(sortedData);
  };

  const chartColors = [
    'rgba(255, 0, 0, 0.8)',       // Red
    'rgba(255, 165, 0, 0.8)',     // Orange
    'rgba(255, 255, 0, 0.8)',     // Yellow
    'rgba(0, 128, 0, 0.8)',       // Green
    'rgba(0, 0, 255, 0.8)',       // Blue
    'rgba(128, 0, 128, 0.8)'      // Purple
  ];

  const pieChartData = levelData.map((value, index) => ({
    name: `Level ${index + 1}`,
    population: value,
    color: chartColors[index],
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: monthlyData,
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Purple color
        strokeWidth: 2 // optional
      }
    ]
  };

  const tableHead = ['TID', 'Book', 'Student', 'Date', 'DaysLeft', 'FineAmount'];

  const tableHeader = () => (
    <View style={styles.tableHeader}>
      {tableHead.map((column, index) => {
        return (
          <TouchableOpacity 
            key={index}
            style={styles.columnHeader} 
            onPress={() => sortTable(column)}>
            <Text style={styles.columnHeaderTxt}>{column + " "} 
              {selectedColumn === column && <MaterialCommunityIcons 
                name={direction === "desc" ? "arrow-down-drop-circle" : "arrow-up-drop-circle"} 
              />}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>ID: {studentId}</Text>
      <Text style={styles.title}>Name: {studentName}</Text>

      <Text style={styles.title}>Total number of books read: {levelData.reduce((a, b) => a + b, 0)}</Text>
      <Text style={styles.title}>Level-wise analysis</Text>
      <PieChart
        data={pieChartData}
        width={Dimensions.get('window').width - 16}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      <Text style={styles.title}>Monthly analysis</Text>
      <LineChart
        data={lineChartData}
        width={Dimensions.get('window').width - 16}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />

<Text style={styles.title}>Recent Checkouts</Text>
      <ScrollView horizontal style={{ marginBottom: 20 }}>
        <View>
          {tableHeader()}
          {transactions.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No recent checkouts</Text>
            </View>
          ) : (
            transactions.map((rowData, index) => (
              <View key={index} style={styles.tableRow}>
                {rowData.map((cellData, cellIndex) => (
                  <Text key={cellIndex} style={styles.columnRowTxt}>
                    {cellData}
                  </Text>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Text style={styles.title}>Recommended Books</Text>
      <View style={styles.recommendedBooksContainer}>
        {recommendedBooks.map((book, index) => (
          <View key={index} style={styles.bookContainer}>
            <Image source={{ uri: book.imageUrl }} style={styles.bookImage} />
            <Text style={styles.bookText}>{book.Book_Name}</Text>
            <Text style={styles.bookText}>Genres: {book.Genres}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    marginBottom: 20,
    marginTop: 60,
    width: 90,
    justifyContent: 'center',
  },
  backText: {
    color: 'white',
    marginLeft: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#FEEC5A",
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
    height: 50,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: 40,
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
  },
  columnHeader: {
    width: 180,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  columnHeaderTxt: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  columnRowTxt: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    width: 180,
  },
  noDataContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width - 32,
  },
  noDataText: {
    fontSize: 14,
    color: 'gray',
  },
  cell: {
    width: 100,
    textAlign: 'center',
    lineHeight: 40,
  },
  recommendedBooksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  bookContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  bookImage: {
    width: 100,
    height: 150,
    marginBottom: 5,
  },
  bookText: {
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ViewStudent;
