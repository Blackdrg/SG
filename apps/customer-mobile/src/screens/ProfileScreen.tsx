import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userJson = await AsyncStorage.getItem('sg_user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserData({
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            // In a real app, we'd have more profile data
          });
          setEditFormData({
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      // In a real app, this would make an API call to update the profile
      // For demo, we'll just update local storage
      await AsyncStorage.setItem('sg_user', JSON.stringify({
        name: editFormData.fullName,
        email: editFormData.email,
        phone: editFormData.phone,
      }));
      
      setUserData({
        fullName: editFormData.fullName,
        email: editFormData.email,
        phone: editFormData.phone,
      });
      
      setIsEditing(false);
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('sg_token');
      await AsyncStorage.removeItem('sg_user');
      navigation.replace('Auth');
    } catch (error) {
      console.error('Failed to logout:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  if (loading && !userData) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {isEditing ? (
            <Text style={styles.headerText}>Edit Profile</Text>
          ) : (
            <Text style={styles.headerText}>Profile</Text>
          )}
        </View>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <View style={styles.editForm}>
            <TextInput
              placeholder="Full Name"
              value={editFormData.fullName}
              onChangeText={(text) => setEditFormData({ ...editFormData, fullName: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              value={editFormData.email}
              onChangeText={(text) => setEditFormData({ ...editFormData, email: text })}
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              placeholder="Phone Number"
              value={editFormData.phone}
              onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TouchableOpacity 
              onPress={handleSaveProfile}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setIsEditing(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                <Text style={styles.profileImage}>👤</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userData?.fullName || 'User Name'}</Text>
                <Text style={styles.profileEmail}>{userData?.email || 'email@example.com'}</Text>
                <Text style={styles.profilePhone}>📞 {userData?.phone || '+91 XXXXX XXXXX'}</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>4.8</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>SPICE+</Text>
                <Text style={styles.statLabel}>Member</Text>
              </View>
            </View>

            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Account</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => {/* TODO: Navigate to wallet */}}>
                <Text style={styles.menuItemText}>Wallet</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('History')}>
                <Text style={styles.menuItemText}>My Orders</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => {/* TODO: Navigate to addresses */}}>
                <Text style={styles.menuItemText}>Addresses</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => {/* TODO: Navigate to payment methods */}}>
                <Text style={styles.menuItemText}>Payment Methods</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => {/* TODO: Navigate to notifications */}}>
                <Text style={styles.menuItemText}>Notifications</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => {/* TODO: Navigate to help & support */}}>
                <Text style={styles.menuItemText}>Help & Support</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: '#f04e31',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f04e31',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    fontSize: 36,
    color: 'white',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  statBox: {
    alignItems: 'center',
    padding: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  menuItemArrow: {
    fontSize: 16,
    color: '#999',
  },
  logoutButton: {
    margin: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingVertical: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#c62828',
    fontWeight: '500',
    textAlign: 'center',
  },
  editForm: {
    padding: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#f04e31',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#f04e31',
  },
  cancelButtonText: {
    color: '#f04e31',
    fontSize: 16,
    fontWeight: '500',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileScreen;