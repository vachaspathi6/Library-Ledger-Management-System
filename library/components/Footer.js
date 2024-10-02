import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const Footer = () => {
  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.footer}>
      <View style={styles.footerSectionLogo}>
        <Image source={require('../assets/rtm.jpg')} style={styles.logo} />
        <Text style={styles.footerTextDescription}>
          We know how to improve literacy and gender equality through education. We just need the
          partnerships and support to do it.
        </Text>
      </View>
      <View style={styles.footerSectionIcons}>
        <Text style={styles.footerTitle}>Connect with us!</Text>
        <View style={styles.iconContainer}>
          {/* WhatsApp */}
          <TouchableOpacity onPress={() => openLink('https://wa.me/919347835425')}>
            <FontAwesome name="whatsapp" size={22} color="#fff" />
          </TouchableOpacity>
          {/* LinkedIn */}
          <TouchableOpacity onPress={() => openLink('https://www.linkedin.com/in/gvachaspathi-gnaneswar/')}>
            <FontAwesome name="linkedin" size={22} color="#fff" />
          </TouchableOpacity>
          {/* Telegram */}
          <TouchableOpacity onPress={() => openLink('https://t.me/vachaspathi')}>
            <FontAwesome name="telegram" size={22} color="#fff" />
          </TouchableOpacity>
          {/* Instagram */}
          <TouchableOpacity onPress={() => openLink('https://www.instagram.com/vachaspathi6')}>
            <FontAwesome name="instagram" size={22} color="#fff" />
          </TouchableOpacity>
          {/* YouTube */}
          <TouchableOpacity onPress={() => openLink('https://www.youtube.com/@sdpprojects7758')}>
            <FontAwesome name="youtube" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Contact details with clickable actions */}
        <View style={styles.contactContainer}>
          {/* Email - opens the default mail app */}
          <TouchableOpacity onPress={() => openLink('mailto:2100032473cseh@gmail.com')}>
            <Text style={styles.footerText}>2100032473cseh@gmail.com</Text>
          </TouchableOpacity>

          {/* Phone number - opens the dialer */}
          <TouchableOpacity onPress={() => openLink('tel:+919347835425')}>
            <Text style={styles.footerText}>+91 9347835425</Text>
          </TouchableOpacity>

          {/* Address - opens a map application */}
          <TouchableOpacity onPress={() => openLink('geo:0,0?q=Vijayawada, Andhra Pradesh')}>
            <Text style={styles.footerText}>Vijayawada, Andhra Pradesh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#000',
    paddingVertical: 20,
    marginTop: 'auto',
  },
  footerSectionLogo: {
    alignItems: 'center',
    flex: 1,
  },
  footerSectionIcons: {
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 75,
    height: 75,
    borderRadius: 80, // Makes the logo round
    overflow: 'hidden', // Ensures the image fits the round shape
  },
  footerTextDescription: {
    color: '#fff',
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    fontSize: 13,
  },
  footerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 8,
  },
  footerText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 10,
  },
  contactContainer: {
    marginTop: 10, // Adds space between icons and contact details
    alignItems: 'center', // Center align contact details
  },
});

export default Footer;
