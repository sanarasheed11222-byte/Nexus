import React, { useState, useRef } from 'react';
import { User, Lock, Bell, Globe, Activity, CreditCard, Camera } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [language, setLanguage] = useState('English');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile({ name, bio });
      await updateProfile(user.id, { name, bio });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      toast.error('File too large! Max size is 800KB');
      return;
    }
    setUploadingPhoto(true);
    try {
      const updated = await profileService.uploadAvatar(file);
      const fullAvatarUrl = 'http://localhost:5000' + updated.avatar;
      await updateProfile(user.id, { avatarUrl: fullAvatarUrl });
      toast.success('Photo updated successfully!');
    } catch (err) {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }
    setUpdatingPassword(true);
    try {
      await api.put('/profile/password', { currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSaveLanguage = () => {
    localStorage.setItem('nexus_language', language);
    toast.success('Language preference saved! (' + language + ')');
  };

  const navItems = [
    { id: 'profile', icon: <User size={18} />, label: 'Profile' },
    { id: 'security', icon: <Lock size={18} />, label: 'Security' },
    { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications' },
    { id: 'language', icon: <Globe size={18} />, label: 'Language' },
    { id: 'activity', icon: <Activity size={18} />, label: 'Activity' },
    { id: 'billing', icon: <CreditCard size={18} />, label: 'Billing' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardBody className="p-2">
            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={"flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors " + (
                    activeTab === item.id
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </CardBody>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar src={user.avatarUrl} name={user.name} size="xl" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-primary-600 text-white p-1.5 rounded-full hover:bg-primary-700 transition-colors"
                    >
                      <Camera size={14} />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <div>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}>
                      {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                    </Button>
                    <p className="mt-2 text-sm text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  />
                  <Input label="Email" type="email" value={user.email} disabled />
                  <Input label="Role" value={user.role} disabled />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3"
                    rows={4}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => { setName(user.name); setBio(user.bio || ''); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      <Badge variant="error" className="mt-1">Not Enabled</Badge>
                    </div>
                    <Button variant="outline" onClick={() => toast.success('2FA setup coming soon!')}>
                      Enable
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleUpdatePassword} disabled={updatingPassword}>
                        {updatingPassword ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {['New Messages', 'Investment Requests', 'Meeting Invites', 'Document Updates'].map(item => (
                  <div key={item} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">{item}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {activeTab === 'language' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Language Preferences</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Language</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['English', 'Urdu', 'Spanish', 'French', 'Arabic', 'Chinese'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={"px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-left " + (
                          language === lang
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveLanguage}>Save Preference</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'activity' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Account Activity</h2>
                <p className="text-sm text-gray-500 mt-1">Recent actions on your account</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Lock size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Account created</p>
                      <p className="text-xs text-gray-500">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Logged in from this device</p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Globe size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Session active</p>
                      <p className="text-xs text-gray-500">Currently signed in as {user.email}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Billing & Plan</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-primary-900">Free Plan</p>
                      <p className="text-sm text-primary-700">You are currently on the free plan</p>
                    </div>
                    <Badge variant="primary">Active</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Unlimited messages</li>
                    <li>Up to 5 active deals</li>
                    <li>Basic document storage</li>
                    <li>Standard support</li>
                  </ul>
                </div>
                <Button variant="outline" onClick={() => toast.success('Premium plans coming soon!')}>
                  Upgrade Plan
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
