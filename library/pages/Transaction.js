import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Button, TouchableOpacity } from 'react-native';
import { DataTable } from 'react-native-paper';
import { openDatabaseAsync } from '../database';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import _ from 'lodash';

const Transaction = () => {
  const [transactionsOut, setTransactionsOut] = useState([]);
  const [transactionsIn, setTransactionsIn] = useState([]);
  const [showCheckOutTable, setShowCheckOutTable] = useState(true);
  const [direction, setDirection] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const itemsPerPage = 10; // Number of items per page

  useEffect(() => {
    const fetchTransactions = async () => {
      const db = await openDatabaseAsync();
      const resultsOut = await db.getAllAsync('SELECT * FROM TransactionsCheckOut');
      const resultsIn = await db.getAllAsync('SELECT * FROM TransactionsCheckIn');

      // Sort transactions by date, showing the most recent first
      const sortedOut = _.orderBy(resultsOut, [transaction => new Date(transaction.Date)], ['desc']);
      const sortedIn = _.orderBy(resultsIn, [transaction => new Date(transaction.Date)], ['desc']);

      setTransactionsOut(sortedOut);
      setTransactionsIn(sortedIn);
    };

    fetchTransactions();
  }, []);

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

  const paginate = (transactions) => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return transactions.slice(start, end);
  };

  const handleNextPage = () => {
    const totalItems = showCheckOutTable ? transactionsOut.length : transactionsIn.length;
    if (currentPage < Math.ceil(totalItems / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
      {/* Your existing charts and other elements */}
      
      <View style={styles.buttonContainer}>
        <Button
          title="Check-Out Transactions"
          onPress={() => { setShowCheckOutTable(true); setCurrentPage(1); }} // Reset page when switching tables
          color={showCheckOutTable ? '#2196F3' : '#64B5F6'}
        />
        <Button
          title="Check-In Transactions"
          onPress={() => { setShowCheckOutTable(false); setCurrentPage(1); }} // Reset page when switching tables
          color={!showCheckOutTable ? '#4CAF50' : '#8BC34A'}
        />
      </View>

      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>{showCheckOutTable ? 'Transactions Check-Out' : 'Transactions Check-In'}</Text>
        <ScrollView horizontal={true}>
          <DataTable style={styles.dataTable}>
            {tableHeader(showCheckOutTable ? checkOutHeaders : checkInHeaders)}
            {(showCheckOutTable ? paginate(prepareCheckOutData(transactionsOut)) : paginate(prepareCheckInData(transactionsIn))).map((row, index) => (
              <DataTable.Row key={index} style={{ ...styles.tableRow, backgroundColor: index % 2 === 1 ? '#F0FBFC' : 'white' }}>
                {row.map((cell, cellIndex) => (
                  <DataTable.Cell key={cellIndex} style={styles.tableCell}>{cell}</DataTable.Cell>
                ))}
              </DataTable.Row>
            ))}
          </DataTable>
        </ScrollView>
      </View>

      {/* Pagination Buttons */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity style={styles.paginationButton} onPress={handlePrevPage} disabled={currentPage === 1}>
          <Text style={styles.paginationButtonText}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.pageText}>{`Page ${currentPage} of ${Math.ceil((showCheckOutTable ? transactionsOut.length : transactionsIn.length) / itemsPerPage)}`}</Text>
        <TouchableOpacity style={styles.paginationButton} onPress={handleNextPage} disabled={currentPage === Math.ceil((showCheckOutTable ? transactionsOut.length : transactionsIn.length) / itemsPerPage)}>
          <Text style={styles.paginationButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 120,
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  paginationButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  paginationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pageText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
});

export default Transaction;