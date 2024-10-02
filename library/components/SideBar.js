import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StudentsPage from '../pages/StudentsPage';
import BookSearchApp from '../pages/Book';
import TransactionPage from '../pages/inout';
import HomePage from '../pages/HomePage';
import Analytics from '../pages/Analytics';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the specific icon set you want to use
import LoginPage from '../pages/LoginPage';
import ViewStudent from '../pages/ViewStudent';
import ContactUs from '../pages/ContactUs';
import ChatbotIcon from './ChatbotIcon';
import Profile from '../pages/Profile';
import TransactionAnalytics from '../pages/Transaction'; // New Transactions submodule for Analytics
import PerformanceAnalytics from '../pages/Performance'; // New Performance submodule for Analytics

const Sidebar = ({ route }) => {
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAnalyticsDropdownOpen, setIsAnalyticsDropdownOpen] = useState(false); // Analytics dropdown state
  const translateX = useRef(new Animated.Value(-300)).current;

  const  teacherId = route.params.teacherId;
  const closeSidebar = () => {
    Animated.timing(translateX, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsOpen(false);
  };

  const toggleSidebar = () => {
    Animated.timing(translateX, {
      toValue: isOpen ? -300 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleSidebarItemPress = (item) => {
    setSelectedItem(item);
    closeSidebar();

    if (item === 'Logout') {
      setSelectedItem(null);
      navigation.navigate('Login');
    }
  };

  // Toggle Analytics dropdown
  const toggleAnalyticsDropdown = () => {
    setIsAnalyticsDropdownOpen(!isAnalyticsDropdownOpen);
  };

  useEffect(() => {
    if (selectedItem === null) {
      closeSidebar();
    }
  }, [selectedItem]);

  const renderMainContent = () => {
    switch (selectedItem) {
      case 'Students':
        return <StudentsPage />;
      case 'Books':
        return <BookSearchApp />;
      case 'ViewStudent':
        return <ViewStudent />;
      case 'Transactions':
        return <TransactionPage />;
      case 'HomePage':
        return <HomePage />;
      case 'Analytics':
        return <Analytics />;
      case 'TransactionAnalytics':
        return <TransactionAnalytics />; // Render Transaction Analytics
      case 'PerformanceAnalytics':
        return <PerformanceAnalytics />; // Render Performance Analytics
      case 'ContactUs':
        return <ContactUs />;
      case 'Chatbot':
        return <ChatbotIcon />;
      case 'Profile':
        return <Profile teacherId={teacherId} />;
      case 'Logout':
        return <LoginPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleSidebar} style={styles.toggleButton}>
        {isOpen ? <Icon name="angle-double-left" size={20} /> : <Icon name="angle-double-right" size={20} />}
      </TouchableOpacity>

      {renderMainContent()}

      <Animated.View style={[styles.sidebar, { transform: [{ translateX }] }]}>
        <Text></Text>
        <Text></Text>
        <Text></Text>
        <Text></Text>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => handleSidebarItemPress('HomePage')}>
          <Icon name="home" size={20} color="#000" style={styles.icon} />
          <Text style={styles.sidebarText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem} onPress={() => handleSidebarItemPress('Books')}>
          <Icon name="book" size={20} color="#000" style={styles.icon} />
          <Text style={styles.sidebarText}>Books</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem} onPress={() => handleSidebarItemPress('Transactions')}>
          <Icon name="exchange" size={20} color="#000" style={styles.icon} />
          <Text style={styles.sidebarText}>Check-in / Check-out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem} onPress={() => handleSidebarItemPress('Students')}>
          <Icon name="users" size={20} color="#000" style={styles.icon} />
          <Text style={styles.sidebarText}>Students</Text>
        </TouchableOpacity>

        {/* Analytics Dropdown */}
        <TouchableOpacity style={styles.sidebarItem} onPress={toggleAnalyticsDropdown}>
          <Icon name="bar-chart" size={20} color="#000" style={styles.icon} />
          <Text style={styles.sidebarText}>Analytics</Text>
          <Icon name={isAnalyticsDropdownOpen ? "angle-down" : "angle-right"} size={20} color="#000" style={styles.dropdownIcon} />
        </TouchableOpacity>

        {isAnalyticsDropdownOpen && (
          <View style={styles.dropdownContainer}>
            <TouchableOpacity style={styles.subItem} onPress={() => handleSidebarItemPress('TransactionAnalytics')}>
            <Icon name="gears" size={20} color="#000" style={styles.icon} />
              <Text style={styles.subItemText}>Transactions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.subItem} onPress={() => handleSidebarItemPress('PerformanceAnalytics')}>
            <Icon name="line-chart" size={20} color="#000" style={styles.icon} />
              <Text style={styles.subItemText}>Performance</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.sidebarItem} onPress={() => handleSidebarItemPress('ContactUs')}>
          <Icon name="envelope" size={20} color="#000" style={styles.icon} />
          <Text style={styles.sidebarText}>Contact Us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem} onPress={() => handleSidebarItemPress('Chatbot')}>
          <Icon name="comments" size={20} color="#000" style={styles.icon} />
          <Text style={styles.sidebarText}>ChatBot</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem} onPress={() => handleSidebarItemPress('Profile')}>
          <Icon name="user" size={20} color="#000" style={styles.icon} />
          <Text style={styles.sidebarText}>Profile</Text>
        </TouchableOpacity>

        {/* Logout at the bottom */}
        <View style={styles.bottomItem}>
          <TouchableOpacity style={styles.sidebarItem} onPress={() => handleSidebarItemPress('Logout')}>
            <Icon name="sign-out" size={20} color="#000" style={styles.icon} />
            <Text style={styles.sidebarText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: 'rgb(255,255,255)',
    padding: 20,
    zIndex: 100,
    elevation: 5,
  },
  toggleButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    zIndex: 110, // Ensures the button is always on top
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  sidebarText: {
    fontSize: 18,
    marginVertical: 10,
    marginLeft: 15,
  },
  icon: {
    width: 25,
  },
  dropdownIcon: {
    marginLeft: 'auto',
  },
  dropdownContainer: {
    paddingLeft: 40, // Indent for the sub-items
  },
  subItem: {
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subItemText: {
    fontSize: 18,
    color: 'grey',
    marginLeft: 10,
  },
  bottomItem: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
});

export default Sidebar;
