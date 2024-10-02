import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Button } from 'react-native';
import { openDatabaseAsync } from '../database'; // SQLite import

const Profile = ({ teacherId }) => {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    dob: '',
    joined: '',
    location: '',
    contact: '',
    email: '',
    nationality: '',
    maritalStatus: '',
    motherTongue: '',
    bloodGroup: '',
    qualifications: '',
    profilePicture: null,
    designation: '',
  });

  const [editable, setEditable] = useState(false); // Toggle Edit Mode
  const [profilePicUrl, setProfilePicUrl] = useState(''); // For profile picture URL input

  useEffect(() => {
    // Load profile data from SQLite using getFirstAsync
    const loadProfileData = async () => {
      try {
        const db = await openDatabaseAsync();
        const firstRow = await db.getFirstAsync('SELECT * FROM Teachers WHERE TeacherID = ?', [teacherId]);

        if (firstRow) {
          setProfile({
            name: firstRow.TeacherName,
            age: firstRow.Age ? firstRow.Age.toString() : '',
            gender: firstRow.Gender || '',
            dob: firstRow.DateOfBirth || '',
            joined: firstRow.JoinedDate || '',
            location: firstRow.Location || '',
            contact: firstRow.ContactInfo || '',
            email: firstRow.Email || '',
            nationality: firstRow.Nationality || '',
            maritalStatus: firstRow.MartialStatus || '',
            motherTongue: firstRow.MotherTongue || '',
            bloodGroup: firstRow.BloodGroup || '',
            qualifications: firstRow.Qualifications || '',
            profilePicture: firstRow.ProfilePicture || null,
            designation: firstRow.Designation || '', // Fetch designation from backend
          });
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    loadProfileData();
  }, [teacherId]);

  const saveProfile = async () => {
    try {
      const db = await openDatabaseAsync();
      const result = await db.runAsync(
        'UPDATE Teachers SET TeacherName = ?, Age = ?, Gender = ?, DateOfBirth = ?, JoinedDate = ?, Location = ?, ContactInfo = ?, Email = ?, Nationality = ?, MartialStatus = ?, MotherTongue = ?, BloodGroup = ?, Qualifications = ?, ProfilePicture = ?, Designation = ? WHERE TeacherID = ?',
        [
          profile.name,
          parseInt(profile.age, 10) || null,
          profile.gender,
          profile.dob,
          profile.joined,
          profile.location,
          profile.contact,
          profile.email,
          profile.nationality,
          profile.maritalStatus,
          profile.motherTongue,
          profile.bloodGroup,
          profile.qualifications,
          profile.profilePicture,
          profile.designation, // Save the designation
          teacherId,
        ]
      );

      if (result.changes > 0) {
        console.log('Profile updated successfully');
        setEditable(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teacher Profile</Text>
        <Button title={editable ? 'Save' : 'Edit'} onPress={editable ? saveProfile : () => setEditable(true)} />
      </View>

      <View style={styles.profileContainer}>
        {editable ? (
          <View>
            <TextInput
              style={styles.profileInput}
              value={profilePicUrl}
              placeholder="Paste profile picture URL here"
              onChangeText={setProfilePicUrl}
              onEndEditing={() => setProfile((prevState) => ({ ...prevState, profilePicture: profilePicUrl }))}
            />
          </View>
        ) : (
          <Image
            source={profile.profilePicture ? { uri: profile.profilePicture } : require('../assets/icon.png')}
            style={styles.profileImage}
          />
        )}
        {editable ? (
          <TextInput
            style={styles.editableInput} // Use the new style here
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
          />
        ) : (
          <Text style={styles.profileName}>{profile.name || 'N/A'}</Text>
        )}
        {editable ? (
          <TextInput
            style={styles.editableInput} // Use the new style here
            value={profile.age}
            onChangeText={(text) => setProfile({ ...profile, age: text })}
            keyboardType="numeric"
          />
        ) : (
          <Text style={styles.profileAge}>{profile.age ? `${profile.age} Years Old` : 'N/A'}</Text>
        )}
        {editable ? (
          <TextInput
            style={styles.editableInput} // Use the new style here
            value={profile.designation}
            placeholder="Enter designation"
            onChangeText={(text) => setProfile({ ...profile, designation: text })}
          />
        ) : (
          <Text style={styles.matchButton}>{profile.designation || 'N/A'}</Text>
        )}
      </View>

      <View style={styles.infoContainer}>
        <ProfileInfoRow label="Date of Birth" value={profile.dob} editable={editable} onChange={(text) => setProfile({ ...profile, dob: text })} />
        <ProfileInfoRow label="Gender" value={profile.gender} editable={editable} onChange={(text) => setProfile({ ...profile, gender: text })} />
        <ProfileInfoRow label="Joined" value={profile.joined} editable={editable} onChange={(text) => setProfile({ ...profile, joined: text })} />
        <ProfileInfoRow label="Location" value={profile.location} editable={editable} onChange={(text) => setProfile({ ...profile, location: text })} />
        <ProfileInfoRow label="Contact" value={profile.contact} editable={editable} onChange={(text) => setProfile({ ...profile, contact: text })} />
        <ProfileInfoRow label="Email" value={profile.email} editable={editable} onChange={(text) => setProfile({ ...profile, email: text })} />
        <ProfileInfoRow label="Nationality" value={profile.nationality} editable={editable} onChange={(text) => setProfile({ ...profile, nationality: text })} />
        <ProfileInfoRow label="Marital Status" value={profile.maritalStatus} editable={editable} onChange={(text) => setProfile({ ...profile, maritalStatus: text })} />
        <ProfileInfoRow label="Mother Tongue" value={profile.motherTongue} editable={editable} onChange={(text) => setProfile({ ...profile, motherTongue: text })} />
        <ProfileInfoRow label="Blood Group" value={profile.bloodGroup} editable={editable} onChange={(text) => setProfile({ ...profile, bloodGroup: text })} />
        <ProfileInfoRow label="Qualifications" value={profile.qualifications} editable={editable} onChange={(text) => setProfile({ ...profile, qualifications: text })} />
      </View>
    </ScrollView>
  );
};

const ProfileInfoRow = ({ label, value, editable, onChange }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    {editable ? (
      <TextInput style={styles.editableInput} value={value || ''} onChangeText={onChange} />
    ) : (
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 100,
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  matchButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    color: 'black',
    fontSize: 16,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileInput: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 5,
    width: '80%',
    textAlign: 'center',
  },
  editableInput: {
    borderBottomWidth: 1,
    borderColor: '#2ECC71', // Change border color when editable
    marginBottom: 10,
    padding: 5,
    width: '60%',
    textAlign: 'center',
    backgroundColor: '#E8F5E9', // Light green background to indicate editability
    borderRadius: 5, // Optional: for rounded corners
    elevation: 2, // Optional: to add some shadow for depth
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profileAge: {
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
  },
  infoContainer: {
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    margin: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 16,
  },
});

export default Profile;
