import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Button, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { DataTable } from 'react-native-paper';
import { openDatabaseAsync } from '../database';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import _ from 'lodash';
import { PieChart } from 'react-native-chart-kit';

const Analytics = () => {
  const [transactionsOut, setTransactionsOut] = useState([]);
  const [transactionsIn, setTransactionsIn] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [showCheckOutTable, setShowCheckOutTable] = useState(true);
  const [direction, setDirection] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [genreData, setGenreData] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const db = await openDatabaseAsync();
      const resultsOut = await db.getAllAsync('SELECT * FROM TransactionsCheckOut');
      const resultsIn = await db.getAllAsync('SELECT * FROM TransactionsCheckIn');

      setTransactionsOut(resultsOut);
      setTransactionsIn(resultsIn);

      const allTransactions = [...resultsOut, ...resultsIn];
      const uniqueMonths = Array.from(new Set(allTransactions.map(transaction => {
        const date = new Date(transaction.Date);
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      })));

      uniqueMonths.sort((a, b) => new Date(a) - new Date(b));

      const monthlyData = new Array(uniqueMonths.length).fill(0);

      resultsOut.forEach(transaction => {
        const month = `${new Date(transaction.Date).getFullYear()}-${new Date(transaction.Date).getMonth() + 1}`;
        const index = uniqueMonths.indexOf(month);
        if (index !== -1) {
          monthlyData[index]++;
        }
      });

      resultsIn.forEach(transaction => {
        const month = `${new Date(transaction.Date).getFullYear()}-${new Date(transaction.Date).getMonth() + 1}`;
        const index = uniqueMonths.indexOf(month);
        if (index !== -1) {
          monthlyData[index]++;
        }
      });

      setChartData({
        labels: uniqueMonths.map(month => new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' })),
        datasets: [{ data: monthlyData }],
      });

      // Fetch and calculate genre data for pie chart
      const genreCounts = {};
      for (const transaction of resultsOut) {
        const bookId = transaction.Book.split(',')[1].trim(); // Assuming format is "Book_Name, ID"
        const book = await db.getFirstAsync('SELECT * FROM Books WHERE Book_ID = ?', bookId);
        if (book && book.Genres) {
          const genres = book.Genres.split(',').map(genre => genre.trim());
          genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        }
      }

      const genreChartData = Object.keys(genreCounts).map((genre, index) => ({
        name: genre,
        count: genreCounts[genre],
        color: genreColors[index % genreColors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      }));

      setGenreData(genreChartData);
    };

    fetchTransactions();
  }, []);

  const genreColors = ['#FF6347', '#FFA500', '#FFD700', '#ADFF2F', '#00FFFF', '#7B68EE']; // Fixed colors for genres

  const sortTable = (column) => {
    const newDirection = direction === 'desc' ? 'asc' : 'desc';
    const sortedData = _.orderBy(
      showCheckOutTable ? transactionsOut : transactionsIn,
      [transaction => new Date(transaction.Date)],
      [newDirection]
    );
    setSelectedColumn(column);
    setDirection(newDirection);
    showCheckOutTable ? setTransactionsOut(sortedData) : setTransactionsIn(sortedData);
  };
  

  const checkOutHeaders = ['ID', 'Book', 'Student', 'Date', 'DaysLeft', 'FineAmount'];
  const checkInHeaders = ['ID', 'Book', 'Student', 'Date', 'Feedback'];

  const prepareCheckOutData = (transactions) => {
    return transactions.map(transaction => {
      const createdDate = new Date(transaction.Date);
      const currentDate = new Date();
      const daysLeft = Math.max(0, 7 - Math.ceil((currentDate - createdDate) / (1000 * 60 * 60 * 24)));
      const fineAmount = daysLeft < 0 ? Math.abs(daysLeft) : 0;
      return [
        transaction.TID,
        transaction.Book,
        transaction.Student,
        transaction.Date,
        daysLeft,
        fineAmount,
      ];
    });
  };

  const prepareCheckInData = (transactions) => {
    return transactions.map(transaction => [
      transaction.TID,
      transaction.Book,
      transaction.Student,
      transaction.Date,
      transaction.Feedback,
    ]);
  };

  const tableHeader = (headers) => (
    <View style={styles.tableHeader}>
      {headers.map((header, index) => (
        <TouchableOpacity
          key={index}
          style={styles.columnHeader}
          onPress={() => sortTable(header)}>
          <Text style={styles.columnHeaderTxt}>{header + ' '}
            {selectedColumn === header && (
              <MaterialCommunityIcons
                name={direction === 'desc' ? 'arrow-down-drop-circle' : 'arrow-up-drop-circle'}
              />
            )}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Total books checked-out</Text>
      <BarChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
      />
      <View style={styles.pieChartContainer}>
        <Text style={styles.tableTitle}>Genres Read by Children</Text>
        {genreData.length > 0 ? (
          <PieChart
            data={genreData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={pieChartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Text>Loading Genre Data...</Text>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Check-Out Transactions"
          onPress={() => setShowCheckOutTable(true)}
          color={showCheckOutTable ? '#2196F3' : '#64B5F6'}
        />
        <Button
          title="Check-In Transactions"
          onPress={() => setShowCheckOutTable(false)}
          color={!showCheckOutTable ? '#4CAF50' : '#8BC34A'}
        />
      </View>
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>{showCheckOutTable ? 'Transactions Check-Out' : 'Transactions Check-In'}</Text>
        <ScrollView horizontal={true}>
          <DataTable style={styles.dataTable}>
            {tableHeader(showCheckOutTable ? checkOutHeaders : checkInHeaders)}
            {(showCheckOutTable ? prepareCheckOutData(transactionsOut) : prepareCheckInData(transactionsIn)).map((row, index) => (
              <DataTable.Row key={index} style={{ ...styles.tableRow, backgroundColor: index % 2 === 1 ? '#F0FBFC' : 'white' }}>
                {row.map((cell, cellIndex) => (
                  <DataTable.Cell key={cellIndex} style={styles.tableCell}>{cell}</DataTable.Cell>
                ))}
              </DataTable.Row>
            ))}
          </DataTable>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 10,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '1',
    stroke: '#ffa726',
  },
};

const pieChartConfig = {
  backgroundGradientFrom: '#1E2923',
  backgroundGradientTo: '#08130D',
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  propsForLabels: {
    fontSize: 12,
  },
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  chart: {
    marginVertical: 20,
    alignSelf: 'center',
  },
  pieChartContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 20,
  },
  tableContainer: {
    marginHorizontal: 10,
    marginVertical: 20,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
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
    height: 40,
    alignItems: 'center',
  },
  columnHeader: {
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnHeaderTxt: {
    color: 'white',
    fontWeight: 'bold',
  },
  tableCell: {
    width: 180,
    textAlign: 'center',
    justifyContent: 'center',
  },
});

export default Analytics;
