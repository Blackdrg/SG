import React, { useState } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { API_URL } from '@spicegarden/shared/constants';

const ResetPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [formData, setFormData] = useState({ email: '', code: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');
    
    try {
      setLoading(true);
      
      if (step === 'email') {
        if (!formData.email) {
          setError('Please enter your email');
          return;
        }
        
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });
        
        if (res.ok) {
          setStep('code');
          setSuccessMessage('If your email exists in our system, we have sent a reset code to it.');
        } else {
          const errorData = await res.json();
          setError(errorData.message || 'Failed to send reset code');
        }
      } else if (step === 'code') {
        if (!formData.code) {
          setError('Please enter the reset code');
          return;
        }
        
        const res = await fetch(`${API_URL}/auth/verify-reset-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, code: formData.code }),
        });
        
        if (res.ok) {
          setStep('password');
        } else {
          const errorData = await res.json();
          setError(errorData.message || 'Invalid or expired code');
        }
      } else if (step === 'password') {
        if (!formData.password) {
          setError('Please enter a new password');
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return;
        }
        
        const res = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            code: formData.code,
            password: formData.password,
          }),
        });
        
        if (res.ok) {
          setSuccessMessage('Password reset successful! You can now log in with your new password.');
          // Auto-navigate to login after a delay
          setTimeout(() => {
            router.push('/auth');
          }, 2000);
        } else {
          const errorData = await res.json();
          setError(errorData.message || 'Failed to reset password');
        }
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
        <h1 style={{ color: DESIGN_TOKENS.colors.primary }}>&#x1F511; Reset Password</h1>
        <p style={{ color: '#666', margin: 0 }}>Enter your email to reset your password</p>
      </div>

      <Card title={step === 'email' ? 'Reset Password' : step === 'code' ? 'Verify Code' : 'Set New Password'}>
        {error && (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: DESIGN_TOKENS.spacing.md, fontSize: '14px' }}>
            {error}
          </div>
        )}
        {successMessage && (
          <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '8px 12px', borderRadius: 4, marginBottom: DESIGN_TOKENS.spacing.md, fontSize: '14px' }}>
            {successMessage}
          </div>
        )}

        {step === 'email' && (
          <>
            <div style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
              />
            </div>
            
            <Button
              label={loading ? 'Sending...' : 'Send Reset Code'}
              onClick={handleSubmit}
            />
          </>
        )}

        {step === 'code' && (
          <>
            <p style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
              We've sent a reset code to <strong>{formData.email}</strong>. Please check your email.
            </p>
            
            <div style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
              <input
                type="text"
                placeholder="Reset Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
              />
            </div>
            
            <Button
              label={loading ? 'Verifying...' : 'Verify Code'}
              onClick={handleSubmit}
            />
          </>
        )}

        {step === 'password' && (
          <>
            <div style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
              <input
                type="password"
                placeholder="New Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
              />
            </div>
            
            <div style={{ marginBottom: DESIGN_TOKENS.spacing.md }}>
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
              />
            </div>
            
            <Button
              label={loading ? 'Resetting...' : 'Reset Password'}
              onClick={handleSubmit}
            />
          </>
        )}
      </Card>

      <div style={{ textAlign: 'center', marginTop: DESIGN_TOKENS.spacing.lg }}>
        <button
          type="button"
          onClick={() => router.push('/auth')}
          style={{ background: 'none', border: 'none', color: DESIGN_TOKENS.colors.primary, cursor: 'pointer', fontSize: 14 }}
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;