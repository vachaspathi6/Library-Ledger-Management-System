import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ContributionGraph, PieChart, BarChart } from 'react-native-chart-kit';
import { openDatabaseAsync } from '../database';
import _ from 'lodash';

const Performance = () => {
  const [commitsData, setCommitsData] = useState([]);
  const [genreData, setGenreData] = useState([]);
  const [levelData, setLevelData] = useState([]); // Add levelData state for BarChart
  const [selectedDate, setSelectedDate] = useState(null); // State to track selected date for hover effect
  const [selectedCount, setSelectedCount] = useState(0); // State to track the count on tap

  useEffect(() => {
    const fetchTransactions = async () => {
      const db = await openDatabaseAsync();
      const resultsOut = await db.getAllAsync('SELECT * FROM TransactionsCheckOut');
      const resultsIn = await db.getAllAsync('SELECT * FROM TransactionsCheckIn');

      const allTransactions = [...resultsOut, ...resultsIn];

      // Format data for the ContributionGraph (heatmap)
      const heatmapData = allTransactions.reduce((acc, transaction) => {
        const date = new Date(transaction.Date);
        const isoDate = date.toISOString().split('T')[0];

        acc.push({
          date: isoDate,
          count: (acc.find(d => d.date === isoDate) ? acc.find(d => d.date === isoDate).count : 0) + 1,
        });
        return acc;
      }, []);

      const groupedData = _(heatmapData)
        .groupBy('date')
        .map((group, date) => ({
          date,
          count: group.length,
        }))
        .value();

      setCommitsData(groupedData);

      // Fetch and calculate genre data for pie chart
      const genreCounts = {};
      const levelCounts = {};

      for (const transaction of resultsOut) {
        const bookId = transaction.Book.split(',')[1].trim(); // Assuming format is "Book_Name, ID"
        const book = await db.getFirstAsync('SELECT * FROM Books WHERE Book_ID = ?', bookId);

        if (book) {
          // Count genres
          if (book.Genres) {
            const genres = book.Genres.split(',').map(genre => genre.trim());
            genres.forEach(genre => {
              genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
          }

          // Count levels
          const level = parseInt(book.Level, 10); // Assuming there's a 'Level' field in the Books table
          if (level >= 1 && level <= 6) {
            levelCounts[level] = (levelCounts[level] || 0) + 1;
          }
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

      const levelArray = [levelCounts[1] || 0, levelCounts[2] || 0, levelCounts[3] || 0, levelCounts[4] || 0, levelCounts[5] || 0, levelCounts[6] || 0];
      setLevelData(levelArray); // Set level data for BarChart
    };

    fetchTransactions();
  }, []);

  const genreColors = ['#FF6347', '#FFA500', '#FFD700', '#ADFF2F', '#00FFFF', '#7B68EE']; // Fixed colors for genres

  const handleBoxPress = (value) => {
    setSelectedDate(value.date);
    setSelectedCount(value.count);
    alert(`Date: ${new Date(value.date).toLocaleDateString()}, Checkouts: ${value.count}`);
  };

  const getColorForCount = (count) => {
    const opacity = Math.min(count / 10, 1); // Adjust opacity based on count
    return `rgba(0, 0, 255, ${opacity})`;
  };

  // Prepare data for ContributionGraph
  const contributionData = commitsData.map(item => ({
    date: item.date,
    count: item.count,
    color: getColorForCount(item.count), // Get color based on count
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Daily Book Checkout Heat Map</Text>
      <View style={styles.chartContainer}>
        <View style={styles.weekdaysContainer}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <Text key={day} style={styles.weekdayLabel}>{day}</Text>
          ))}
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
          <ContributionGraph
            values={contributionData}
            endDate={new Date()}
            numDays={365} // Showing all 365 days
            width={Dimensions.get('window').width * 3 + 90} // Adjust width to ensure all days fit
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 10,
              },
            }}
            style={styles.chart}
            onDayPress={handleBoxPress}
          />
        </ScrollView>
      </View>
      <View style={styles.pieChartContainer}>
        <Text style={styles.title}>Genres Read by Children</Text>
        {genreData.length > 0 ? (
          <PieChart
            data={genreData}
            width={Dimensions.get('window').width - 40}
            height={225}
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
      
      <Text style={styles.title}>Level-wise Analysis of Books Checked Out</Text>
      <BarChart
        data={{
          labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'],
          datasets: [{ data: levelData }],
        }}
        width={Dimensions.get('window').width +10}
        height={225}
        chartConfig={barChartConfig}
        style={styles.barchart}
      />
    </ScrollView>
  );
};

const barChartConfig = {
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
    paddingTop: 100,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
    justifyContent: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 20,
  },
  weekdaysContainer: {
    justifyContent: 'space-between',
    marginRight: 10,
    marginLeft: 10,
    marginTop: 45,
  },
  weekdayLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    lineHeight: 22, // Centers text vertically
  },
  chart: {
    borderRadius: 16,
    shadowColor: '#000',
  },
  barchart: {
    marginVertical: 20,
    alignSelf: 'center',
    marginRight: 40,
  },
  pieChartContainer: {
    marginVertical: 20,
    alignSelf: 'center',
    marginLeft: 20,
  },
});

export default Performance;
