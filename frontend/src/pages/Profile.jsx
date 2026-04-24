import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { useToast } from '../components/Toast';
import { User, Lock, Mail, Shield, Save, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useFormValidation, ValidatedInput, validators } from '../components/FormValidation';

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Profile form
  const profileForm = useFormValidation(
    {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      department: user?.department || '',
      title: user?.title || '',
      bio: user?.bio || '',
    },
    {
      firstName: [validators.required],
      lastName: [validators.required],
      phone: [validators.phone],
    }
  );

  // Password form
  const passwordForm = useFormValidation(
    { currentPassword: '', newPassword: '', confirmPassword: '' },
    {
      currentPassword: [validators.required],
      newPassword: [validators.required, validators.password],
      confirmPassword: [validators.required, validators.match('new password', () => passwordForm.values.newPassword)],
    }
  );

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.validateAll()) return;

    setSaving(true);
    try {
      await authApi.updateProfile(profileForm.values);
      if (fetchUser) await fetchUser();
      addToast('Profile updated successfully', 'success');
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.validateAll()) return;

    setSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.values.currentPassword,
        newPassword: passwordForm.values.newPassword,
      });
      passwordForm.reset();
      addToast('Password changed successfully', 'success');
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await authApi.resendVerification();
      addToast('Verification email sent', 'success');
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to send verification', 'error');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'email', label: 'Email Verification', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="card p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-6">Personal Information</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedInput
                    label="First Name"
                    name="firstName"
                    value={profileForm.values.firstName}
                    error={profileForm.errors.firstName}
                    touched={profileForm.touched.firstName}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    required
                  />
                  <ValidatedInput
                    label="Last Name"
                    name="lastName"
                    value={profileForm.values.lastName}
                    error={profileForm.errors.lastName}
                    touched={profileForm.touched.lastName}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email</label>
                    <input type="email" value={user?.email || ''} disabled className="input bg-gray-50" />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <ValidatedInput
                    label="Phone"
                    name="phone"
                    value={profileForm.values.phone}
                    error={profileForm.errors.phone}
                    touched={profileForm.touched.phone}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    placeholder="555-1234"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedInput
                    label="Department"
                    name="department"
                    value={profileForm.values.department}
                    error={profileForm.errors.department}
                    touched={profileForm.touched.department}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    placeholder="Engineering"
                  />
                  <ValidatedInput
                    label="Title"
                    name="title"
                    value={profileForm.values.title}
                    error={profileForm.errors.title}
                    touched={profileForm.touched.title}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    placeholder="Senior Engineer"
                  />
                </div>

                <ValidatedInput
                  label="Bio"
                  name="bio"
                  type="textarea"
                  value={profileForm.values.bio}
                  error={profileForm.errors.bio}
                  touched={profileForm.touched.bio}
                  onChange={profileForm.handleChange}
                  onBlur={profileForm.handleBlur}
                  placeholder="Tell us about yourself..."
                />

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-600">
                    Role: <span className="font-medium">{user?.role}</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-6">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="label">Current Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={passwordForm.values.currentPassword}
                      onChange={(e) => passwordForm.handleChange('currentPassword', e.target.value)}
                      onBlur={() => passwordForm.handleBlur('currentPassword')}
                      className={`input pr-10 ${passwordForm.touched.currentPassword && passwordForm.errors.currentPassword ? 'border-red-500' : ''}`}
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordForm.touched.currentPassword && passwordForm.errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordForm.errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="label">New Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={passwordForm.values.newPassword}
                      onChange={(e) => passwordForm.handleChange('newPassword', e.target.value)}
                      onBlur={() => passwordForm.handleBlur('newPassword')}
                      className={`input pr-10 ${passwordForm.touched.newPassword && passwordForm.errors.newPassword ? 'border-red-500' : ''}`}
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordForm.touched.newPassword && passwordForm.errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordForm.errors.newPassword}</p>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Must be 8+ chars with uppercase, lowercase, and number
                  </div>
                </div>

                <ValidatedInput
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.values.confirmPassword}
                  error={passwordForm.errors.confirmPassword}
                  touched={passwordForm.touched.confirmPassword}
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                  required
                />

                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Email Verification Tab */}
          {activeTab === 'email' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-6">Email Verification</h2>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${user?.emailVerified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {user?.emailVerified ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {user?.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {user?.emailVerified
                      ? `Your email (${user?.email}) has been verified.`
                      : `Please verify your email (${user?.email}) to access all features.`
                    }
                  </p>
                  {!user?.emailVerified && (
                    <button onClick={handleResendVerification} className="btn btn-primary mt-4">
                      Resend Verification Email
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Role-Based Access</h3>
                    <p className="text-sm text-gray-600">Your current role: <span className="font-medium">{user?.role}</span></p>
                  </div>
                  <span className="badge badge-blue">{user?.role}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Last Login</h3>
                    <p className="text-sm text-gray-600">
                      {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Current session'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Account Created</h3>
                    <p className="text-sm text-gray-600">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '--'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900">Security Features Active</h3>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700">
                    <li>- JWT token authentication (7-day expiration)</li>
                    <li>- Rate limiting on all API endpoints</li>
                    <li>- Security headers (HSTS, XSS Protection, etc.)</li>
                    <li>- RBAC authorization checks</li>
                    <li>- Password hashing with bcrypt (12 rounds)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
