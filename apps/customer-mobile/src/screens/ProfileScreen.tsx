import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_TOKENS } from '@spicegarden/ui';

// Strict union for profile navigation destinations
type ProfileScreen =
  | 'Orders'
  | 'Favorites'
  | 'Wallet'
  | 'Addresses'
  | 'Notifications'
  | 'Settings'
  | 'Support'
  | 'Privacy'
  | 'Logout';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

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
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: DESIGN_TOKENS.motion.page,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      }
    };

    loadProfile();
  }, [fadeAnim]);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateEmail(editFormData.email)) return;
    
    try {
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
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}
        accessible={true}
        accessibilityLabel="Loading profile"
        accessibilityRole="progressbar"
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </Animated.View>
      </View>
    );
  }

  const menuItems = [
    { id: 'wallet', label: 'Wallet', icon: '💰', screen: 'Wallet' },
    { id: 'orders', label: 'My Orders', icon: '📦', screen: 'History' },
    { id: 'addresses', label: 'Addresses', icon: '📍', screen: 'Addresses' },
    { id: 'payment', label: 'Payment Methods', icon: '💳', screen: 'Payment' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', screen: 'Notifications' },
    { id: 'support', label: 'Help & Support', icon: '❓', screen: 'Support' },
  ];

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>
              {isEditing ? 'Edit Profile' : 'Profile'}
            </Text>
          </View>
          {!isEditing && (
            <TouchableOpacity 
              onPress={() => setIsEditing(true)} 
              style={styles.editButton}
              accessibilityLabel="Edit profile"
              accessibilityRole="button"
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  placeholder="Enter your full name"
                  value={editFormData.fullName}
                  onChangeText={(text) => setEditFormData({ ...editFormData, fullName: text })}
                  style={styles.input}
                  accessibilityLabel="Full name"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  placeholder="Enter your email"
                  value={editFormData.email}
                  onChangeText={(text) => {
                    setEditFormData({ ...editFormData, email: text });
                    if (errors.email) validateEmail(text);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                  accessibilityLabel="Email address"
                />
                {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  placeholder="Enter your phone number"
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
                  keyboardType="phone-pad"
                  style={styles.input}
                  accessibilityLabel="Phone number"
                />
              </View>
              <TouchableOpacity 
                onPress={handleSaveProfile}
                style={styles.saveButton}
                accessibilityLabel="Save profile changes"
                accessibilityRole="button"
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setIsEditing(false)}
                style={styles.cancelButton}
                accessibilityLabel="Cancel editing"
                accessibilityRole="button"
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
                  <Text style={styles.profileName}>{userData.fullName || 'User Name'}</Text>
                  <Text style={styles.profileEmail}>{userData.email || 'email@example.com'}</Text>
                  <Text style={styles.profilePhone}>📞 {userData.phone || '+91 XXXXX XXXXX'}</Text>
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
                {menuItems.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.menuItem}
                    onPress={() => navigation.navigate(item.screen as ProfileScreen)}
                    accessibilityLabel={`Go to ${item.label}`}
                    accessibilityRole="link"
                  >
                    <Text style={styles.menuItemIcon}>{item.icon}</Text>
                    <Text style={styles.menuItemText}>{item.label}</Text>
                    <Text style={styles.menuItemArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                onPress={handleLogout}
                style={styles.logoutButton}
                accessibilityLabel="Sign out of your account"
                accessibilityRole="button"
              >
                <Text style={styles.logoutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: DESIGN_TOKENS.colors.primary,
    borderTopColor: 'transparent',
  },
  loadingText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 16,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  headerContent: {
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  editButton: {
    padding: DESIGN_TOKENS.spacing.xs,
  },
  editButtonText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.xl,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: DESIGN_TOKENS.colors.primary,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.md,
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
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  profileEmail: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  profilePhone: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: DESIGN_TOKENS.spacing.lg,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
  },
  statBox: {
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.sm,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statLabel: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  menuSection: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
    marginHorizontal: DESIGN_TOKENS.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: DESIGN_TOKENS.spacing.md,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  menuItemIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  menuItemArrow: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
  },
  logoutButton: {
    margin: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    borderRadius: DESIGN_TOKENS.radius.button,
    paddingVertical: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.dangerDark,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  editForm: {
    padding: DESIGN_TOKENS.spacing.md,
  },
  inputGroup: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: DESIGN_TOKENS.spacing.xs,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.input,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    fontSize: 16,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  fieldError: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.danger,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  saveButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 12,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
    marginVertical: DESIGN_TOKENS.spacing.xs,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
    marginVertical: DESIGN_TOKENS.spacing.xs,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.primary,
  },
  cancelButtonText: {
    color: DESIGN_TOKENS.colors.primary,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default ProfileScreen;