import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Shield, CheckCircle2, Edit3, Save, X, Lock, Eye, EyeOff, Calendar, KeyRound } from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
    <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
      <Icon className="w-4 h-4 text-gray-400" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-words">{value || 'Not provided'}</p>
    </div>
  </div>
);

const ProfileSettings = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [saving, setSaving] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdData, setPwdData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [savingPwd, setSavingPwd] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editData.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      await api.put('/auth/profile', editData);
      toast.success('Profile updated! ✅');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdData.new_password !== pwdData.confirm_password) return toast.error('Passwords do not match');
    if (pwdData.new_password.length < 6) return toast.error('Min 6 characters required');
    setSavingPwd(true);
    try {
      await api.put('/auth/change-password', { current_password: pwdData.current_password, new_password: pwdData.new_password });
      toast.success('Password changed! 🔐');
      setIsChangingPwd(false);
      setPwdData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPwd(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2"><User className="w-7 h-7 text-primary" />Profile Settings</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage your personal information.</p>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-r from-primary to-primary-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shrink-0">{initials}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
              <span className="inline-flex items-center gap-1 bg-emerald-400/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            </div>
            <p className="text-primary-200 text-sm capitalize mt-0.5 flex items-center gap-1.5">
              {user?.role === 'admin' && <Shield className="w-3.5 h-3.5 text-accent" />}
              {user?.role} Account
            </p>
          </div>
          <button onClick={() => { setEditData({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' }); setIsEditing(true); }}
            className="shrink-0 inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100">Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoRow icon={User} label="Full Name" value={user?.name} />
          <InfoRow icon={Mail} label="Email Address" value={user?.email} />
          <InfoRow icon={Phone} label="Phone Number" value={user?.phone} />
          <InfoRow icon={MapPin} label="Address" value={user?.address} />
        </div>
      </div>

      {/* Security Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100 flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" />Security</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="font-semibold text-gray-800 text-sm">Password</p>
            <p className="text-xs text-gray-400 mt-0.5">Keep your account secure with a strong password</p>
          </div>
          <button onClick={() => setIsChangingPwd(true)} className="btn-outline text-xs py-1.5 px-3">
            <Lock className="w-3.5 h-3.5 mr-1" /> Change Password
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-backdrop">
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500"><X className="w-4 h-4" /></button>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="label-text">Full Name</label>
                <input type="text" required className="input-field" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
              </div>
              <div>
                <label className="label-text">Phone Number</label>
                <input type="tel" className="input-field" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
              </div>
              <div>
                <label className="label-text">Address</label>
                <textarea rows="3" className="input-field py-2.5" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 btn-ghost border border-gray-200">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5">
                  {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4 mr-1.5" />Save</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPwd && (
        <div className="modal-backdrop">
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsChangingPwd(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500"><X className="w-4 h-4" /></button>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { key: 'current', label: 'Current Password', field: 'current_password' },
                { key: 'new', label: 'New Password', field: 'new_password' },
                { key: 'confirm', label: 'Confirm New Password', field: 'confirm_password' },
              ].map(({ key, label, field }) => (
                <div key={key}>
                  <label className="label-text">{label}</label>
                  <div className="relative">
                    <input type={showPwd[key] ? 'text' : 'password'} required minLength={field !== 'current_password' ? 6 : 1} className="input-field pr-10" placeholder="••••••••" value={pwdData[field]} onChange={e => setPwdData({...pwdData, [field]: e.target.value})} />
                    <button type="button" onClick={() => setShowPwd({...showPwd, [key]: !showPwd[key]})} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                      {showPwd[key] ? <EyeOff style={{width:'15px',height:'15px'}} /> : <Eye style={{width:'15px',height:'15px'}} />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsChangingPwd(false)} className="flex-1 btn-ghost border border-gray-200">Cancel</button>
                <button type="submit" disabled={savingPwd} className="flex-1 btn-primary py-2.5">
                  {savingPwd ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4 mr-1.5" />Update</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
