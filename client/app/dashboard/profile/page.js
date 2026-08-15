'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/authContext';
import { fetchApi } from '../../../lib/api';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  ArrowLeft,
  ShieldCheck,
  Upload,
  Eye,
  Trash2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

  // Profile Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [avatar, setAvatar] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');

  // Hidden File Input References
  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI Status State
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMobile(user.mobile || '');
      setAvatar(user.avatar || '');
      setResumeUrl(user.resumeUrl || '');
    }
  }, [user]);

  // Handle Photo File Upload
  const handlePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileMsg({ type: 'error', text: 'Please select a valid image file (JPG, PNG, WebP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Image file size should be less than 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setProfileMsg({ type: 'success', text: 'Photo uploaded! Click "Save Profile Changes" to save.' });
    };
    reader.readAsDataURL(file);
  };

  // Handle Resume File Upload
  const handleResumeFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
      setProfileMsg({ type: 'error', text: 'Please select a valid document file (.pdf, .doc, .docx).' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Resume file size should be less than 10MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setResumeUrl(reader.result);
      setResumeFileName(file.name);
      setProfileMsg({ type: 'success', text: `Resume "${file.name}" uploaded! Click "Save Profile Changes" to save.` });
    };
    reader.readAsDataURL(file);
  };

  // Remove Photo Avatar
  const handleRemovePhoto = () => {
    setAvatar('');
    setProfileMsg({ type: 'success', text: 'Photo removed. Click "Save Profile Changes" to save.' });
  };

  // Remove Resume
  const handleRemoveResume = () => {
    setResumeUrl('');
    setResumeFileName('');
    setProfileMsg({ type: 'success', text: 'Resume removed. Click "Save Profile Changes" to save.' });
  };

  // Handle Profile Update Submission
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setSavingProfile(true);

    try {
      const res = await fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          mobile,
          avatar,
          resumeUrl,
        }),
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setProfileMsg({ type: 'success', text: 'Profile details updated successfully!' });
      } else {
        setProfileMsg({ type: 'error', text: res.message || 'Failed to update profile' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'An error occurred updating profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetchApi('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (res.success) {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: res.message || 'Failed to change password' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Error updating password' });
    } finally {
      setChangingPassword(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-600 text-sm font-semibold">Loading student profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-dot-pattern">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={handlePhotoFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={resumeInputRef}
        onChange={handleResumeFileChange}
        accept=".pdf,.doc,.docx,application/pdf"
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-sm font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Dashboard</span>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Account Settings</h1>
        <p className="text-slate-600 text-sm font-medium">Manage your profile information, profile photo, resume document, and security password.</p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Section: Avatar Badge Card & Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Avatar Summary Card */}
          <div className="light-card p-6 rounded-3xl border border-slate-200 text-center space-y-4 bg-white shadow-sm">
            <div className="relative w-24 h-24 mx-auto group">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-200 shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl gradient-bg-indigo flex items-center justify-center text-white text-3xl font-black shadow-md">
                  {user.name ? user.name[0].toUpperCase() : 'S'}
                </div>
              )}

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[10px]"
                title="Upload Photo File"
              >
                <Upload className="w-5 h-5 mb-1" />
                <span>Upload</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo File</span>
            </button>

            <div className="space-y-1 pt-1">
              <h3 className="text-lg font-extrabold text-slate-900">{user.name}</h3>
              <p className="text-xs text-slate-500 font-medium truncate">{user.email}</p>
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 capitalize">
              {user.role || 'Student'} Member
            </span>
          </div>

          {/* Left Sidebar Navigation Tabs */}
          <div className="light-card p-3 rounded-2xl border border-slate-200 space-y-1.5 bg-white shadow-xs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'profile'
                  ? 'gradient-bg-indigo text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Details</span>
            </button>

            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'password'
                  ? 'gradient-bg-indigo text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Right Section: Active Tab Form */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' ? (
            /* TAB 1: PROFILE DETAILS FORM */
            <div className="light-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 bg-white shadow-md">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <span>Personal Information</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">Update your profile name, mobile number, photo, and resume document.</p>
              </div>

              {profileMsg.text && (
                <div className={`p-4 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {profileMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-3.5 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-semibold"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email ID (Disabled / Read-Only) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                      Email Address <span className="text-slate-400 font-normal lowercase">(read-only)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-xs font-semibold"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Mobile Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-semibold"
                        placeholder="+1 (555) 000-0000"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  {/* Profile Picture Upload Card */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Profile Photo Avatar</label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {avatar ? (
                          <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-lg object-cover border border-slate-300" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {name ? name[0].toUpperCase() : 'P'}
                          </div>
                        )}
                        <span className="text-xs font-medium text-slate-700">
                          {avatar ? 'Custom Photo Uploaded' : 'Default Avatar'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo</span>
                        </button>
                        {avatar && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resume PDF Upload Card */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Resume Document File</label>
                  
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {resumeFileName ? resumeFileName : resumeUrl ? 'Resume PDF Attached' : 'No Resume Uploaded'}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">Upload your latest PDF or Word document (Max 10MB)</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => resumeInputRef.current?.click()}
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 gradient-bg-indigo text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Resume File</span>
                      </button>

                      {resumeUrl && (
                        <>
                          <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold px-3.5 py-2.5 rounded-xl text-xs border border-slate-300 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>View Resume</span>
                          </a>
                          <button
                            type="button"
                            onClick={handleRemoveResume}
                            className="p-2.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-xl hover:bg-red-50 transition-colors"
                            title="Remove Resume"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center space-x-2 gradient-bg-indigo text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all text-xs disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* TAB 2: CHANGE PASSWORD FORM */
            <div className="light-card p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 bg-white shadow-md">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <span>Change Account Password</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">Update your password to keep your account secure.</p>
              </div>

              {passwordMsg.text && (
                <div className={`p-4 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {passwordMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-semibold"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-semibold"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-semibold"
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full gradient-bg-indigo text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all text-xs flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
