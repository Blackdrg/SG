import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_TOKENS } from '@spicegarden/ui';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

   const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: DESIGN_TOKENS.motion.page,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('Email is required');
    } else if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required');
    } else if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const API_URL = 'http://localhost:3001';

  const handleSubmit = async () => {
    setError('');

    validateEmail(email);
    validatePassword(password);

    if (!isLogin && !name) {
      setError('Name is required');
      return;
    }

    if (!isLogin && !phone) {
      setError('Phone number is required');
      return;
    }

    if (emailError || passwordError) return;

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          ...(!isLogin && { name, phone }),
          deviceName: 'mobile',
          deviceType: 'mobile',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('sg_token', data.access_token);
        await AsyncStorage.setItem('sg_user', JSON.stringify({
          email,
          name: isLogin ? '' : name,
          phone: isLogin ? '' : phone,
        }));
        navigation.replace('Main');
      } else {
        setError(data.message || (isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.'));
        shakeAnimation();
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      shakeAnimation();
    } finally {
      setLoading(false);
    }
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>SpiceGarden</Text>
          <Text style={styles.headerSubtext}>Order food from your favourite restaurants</Text>
        </View>

        <View style={styles.formContainer}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                accessibilityLabel="Full name"
                accessibilityHint="Enter your full name as it appears on your ID"
              />
            </View>
          )}

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.input}
                accessibilityLabel="Phone number"
                accessibilityHint="Enter your mobile number"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) validateEmail(text);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, emailError ? styles.inputError : null]}
              accessibilityLabel="Email address"
              accessibilityHint="Enter your email for account access"
              accessibilityState={{}}
            />
            {emailError && <Text style={styles.fieldError}>{emailError}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) validatePassword(text);
              }}
              secureTextEntry
              style={[styles.input, passwordError ? styles.inputError : null]}
              accessibilityLabel="Password"
              accessibilityHint={isLogin ? "Enter your password" : "Create a secure password"}
              accessibilityState={{}}
            />
            {passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}
          </View>

          {error && (
            <View style={styles.errorContainer} accessibilityLiveRegion="polite">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.button, loading ? styles.buttonLoading : null]}
            disabled={loading}
            accessibilityLabel={isLogin ? "Sign in" : "Create account"}
            accessibilityRole="button"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          onPress={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          style={styles.toggleButton}
          accessibilityLabel={isLogin ? "Create new account" : "Sign in to existing account"}
          accessibilityRole="button"
        >
          <Text style={styles.toggleButtonText}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
    padding: DESIGN_TOKENS.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.xl,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  headerSubtext: {
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  formContainer: {
    width: '100%',
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
  inputError: {
    borderColor: DESIGN_TOKENS.colors.danger,
  },
  fieldError: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.danger,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  errorContainer: {
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  errorText: {
    color: DESIGN_TOKENS.colors.danger,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  button: {
    height: 50,
    backgroundColor: DESIGN_TOKENS.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DESIGN_TOKENS.radius.button,
    marginTop: DESIGN_TOKENS.spacing.md,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  buttonText: {
    color: DESIGN_TOKENS.colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: DESIGN_TOKENS.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: DESIGN_TOKENS.colors.border,
  },
  dividerText: {
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  toggleButton: {
    alignItems: 'center',
  },
  toggleButtonText: {
    color: DESIGN_TOKENS.colors.primary,
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default AuthScreen;