import React, { useState, useEffect } from 'react';
import { Button, Card, DESIGN_TOKENS } from '@spicegarden/ui';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const ProfilePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!token || token === 'demo-token') {
        // Use mock data for demo
        setProfileData({
          fullName: 'Rahul Sharma',
          email: 'rahul@example.com',
          phone: '+91 98765 43210',
          profileImage: null,
          emailVerified: true,
          phoneVerified: true,
          createdAt: '2026-05-01T10:00:00Z',
        });
        setEditFormData({
          fullName: 'Rahul Sharma',
          email: 'rahul@example.com',
          phone: '+91 98765 43210',
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // In a real app, this would be an API call to fetch user profile
        // For now, we'll use the user data from auth state
        setProfileData({
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          profileImage: user?.profileImage || null,
          emailVerified: user?.emailVerified || false,
          phoneVerified: user?.phoneVerified || false,
          createdAt: user?.createdAt || new Date().toISOString(),
        });
        setEditFormData({
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, token]);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      // In a real app, this would be an API call to update profile
      // For now, we'll just update the local state
      setProfileData(editFormData);
      // Update auth state as well
      // dispatch(updateUser(editFormData)); // Assuming we have this action
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth');
  };

  if (loading && !profileData) {
    return (
      <div style={{ padding: DESIGN_TOKENS.spacing.md, minHeight: '100vh', backgroundColor: DESIGN_TOKENS.colors.neutral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: DESIGN_TOKENS.spacing.md }}>
      <div style={{ textAlign: 'center', marginBottom: DESIGN_TOKENS.spacing.xl }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          backgroundColor: DESIGN_TOKENS.colors.primary, 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '48px', 
          color: 'white' 
        }}>
          {profileData?.profileImage ? (
            <img 
              src={profileData.profileImage} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            '👤'
          )}
        </div>
        <h2 style={{ margin: '12px 0 4px 0' }}>{isEditing ? editFormData.fullName : profileData?.fullName || 'User'}</h2>
        <p style={{ color: '#666', margin: 0 }}>{isEditing ? editFormData.email : profileData?.email || ''}</p>
        <p style={{ color: '#999', margin: '4px 0 0 0', fontSize: '14px' }}>{isEditing ? editFormData.phone : profileData?.phone || ''}</p>
        
        {!isEditing && (
          <div style={{ marginTop: DESIGN_TOKENS.spacing.md }}>
            <Button 
              label="Edit Profile" 
              onClick={() => setIsEditing(true)} 
              variant="secondary" 
            />
          </div>
        )}
      </div>

       {isEditing && (
        <>
          <Card title="Edit Profile">
            <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.md }}>
              <div>
                <label htmlFor="fullName" style={{ display: 'block', marginBottom: DESIGN_TOKENS.spacing.xs, fontWeight: '500' }}>
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
                />
              </div>
              
              <div>
                <label htmlFor="email" style={{ display: 'block', marginBottom: DESIGN_TOKENS.spacing.xs, fontWeight: '500' }}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
                />
              </div>
              
              <div>
                <label htmlFor="phone" style={{ display: 'block', marginBottom: DESIGN_TOKENS.spacing.xs, fontWeight: '500' }}>
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  style={{ width: '100%', padding: DESIGN_TOKENS.spacing.sm, borderRadius: DESIGN_TOKENS.radius.sm, border: '1px solid #ddd' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.md, marginTop: DESIGN_TOKENS.spacing.lg }}>
                <Button label="Cancel" onClick={() => setIsEditing(false)} variant="secondary" />
                <Button label="Save Changes" onClick={handleSaveProfile} />
              </div>
            </div>
          </Card>
        </>
      )}

      {!isEditing && (
        <>
          <Card title="Account Information">
            <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Email Verified</span>
                <span>{profileData?.emailVerified ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phone Verified</span>
                <span>{profileData?.phoneVerified ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Member Since</span>
                <span>{new Date(profileData?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

           <Card title="Security">
             <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
               <Button 
                 label="Change Password" 
                 onClick={() => {/* TODO: Implement password change */}} 
                 variant="secondary"
               />
               <Button 
                 label="Manage Devices" 
                 onClick={() => {/* TODO: Implement device management */}} 
                 variant="secondary"
               />
             </div>
           </Card>

           <Card title="Address Management">
             <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
               <Button 
                 label="Manage Addresses" 
                 onClick={() => {/* TODO: Implement address management */}} 
                 variant="secondary"
               />
               <p style={{ color: '#666', fontSize: '14px' }}>
                 Saved addresses will appear here
               </p>
             </div>
           </Card>

           <Card title="Payment Methods">
             <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
               <Button 
                 label="Manage Payment Methods" 
                 onClick={() => {/* TODO: Implement payment method management */}} 
                 variant="secondary"
               />
               <p style={{ color: '#666', fontSize: '14px' }}>
                 Saved payment methods will appear here
               </p>
             </div>
           </Card>

          <div style={{ marginTop: DESIGN_TOKENS.spacing.xl, textAlign: 'center' }}>
            <Button label="Sign Out" onClick={handleLogout} variant="secondary" style={{ width: '100%' }} />
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
