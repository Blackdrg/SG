import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { API_URL } from '@spicegarden/shared/constants';

const AuthPage = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        
        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Please enter email and password');
            return;
        }
        
        if (!isLogin && (!formData.name || !formData.phone)) {
            setError('Please fill in all required fields');
            return;
        }
        
        setLoading(true);
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: isLogin ? undefined : formData.name,
                    phone: isLogin ? undefined : formData.phone,
                    deviceName: 'web',
                    deviceType: 'browser',
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const userData = { email: formData.email, role: 'customer' };
                
                // Update Redux store
                dispatch(setCredentials({ user: userData, token: data.access_token }));
                
                router.push('/');
            } else {
                const errorData = await res.json();
                setError(errorData.message || (isLogin ? 'Login failed' : 'Registration failed'));
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.lg, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.neutral }}>
      <div style={{ textAlign: 'center', marginBottom: DESIGN_TOKENS.spacing.xl }}>
        <h1 style={{ color: DESIGN_TOKENS.colors.primary }}>&#x1F35F; SpiceGarden</h1>
        <p style={{ color: '#666', margin: 0 }}>Order food from your favourite restaurants</p>
      </div>

      <Card title={isLogin ? 'Welcome Back' : 'Create Account'}>
        {error && (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: DESIGN_TOKENS.spacing.md, fontSize: '14px' }}>
            {error}
          </div>
        )}

        {!isLogin && (
          <>
            <div style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
              />
            </div>
          </>
        )}

        <div style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
          />
        </div>

        <Button
          label={loading ? 'Loading…' : isLogin ? 'Sign In' : 'Sign Up'}
          onClick={handleSubmit}
        />

        <div style={{ textAlign: 'center', marginTop: DESIGN_TOKENS.spacing.lg }}>
            {isLogin && (
                <button
                    type="button"
                    onClick={() => { router.push('/reset-password'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: DESIGN_TOKENS.colors.primary, cursor: 'pointer', fontSize: 14 }}
                >
                    Forgot password?
                </button>
            )}
            <div style={{ marginTop: DESIGN_TOKENS.spacing.md }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: DESIGN_TOKENS.spacing.sm }}>Or continue with</div>
                <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.sm, justifyContent: 'center' }}>
                    <button
                        onClick={() => {/* TODO: Implement Google login */}}
                        style={{
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: 4,
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            cursor: 'pointer'
                        }}
                    >
                        🔵 Google
                    </button>
                    <button
                        onClick={() => {/* TODO: Implement Facebook login */}}
                        style={{
                            background: '#1877f2',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            cursor: 'pointer'
                        }}
                    >
                        𝔽 Facebook
                    </button>
                </div>
            </div>
            <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                style={{ background: 'none', border: 'none', color: DESIGN_TOKENS.colors.primary, cursor: 'pointer', fontSize: 14 }}
            >
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;
